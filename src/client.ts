import { SDKConfig, RequestOptions } from "./types";
import { signRequest } from "./auth";
import { APIError, AuthError, BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError, NotImplementedError, RateLimitError, UnacceptableError } from "./errors";
import { AccountResource } from "./resources/account";
import { DevicesResource } from "./resources/devices";
import { MessageResource } from "./resources/messages";

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function calcDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  const exponential = baseDelay * Math.pow(2, attempt);        // 1s, 2s, 4s, 8s...
  const jitter      = Math.random() * baseDelay;               // 0–1000ms random
  return Math.min(exponential + jitter, maxDelay);
}

export class WABeresClient {
    private readonly apiKey: string;
    private readonly secretKey: string;
    private readonly baseUrl: string;
    private readonly timeout: number;
    private readonly maxAttempts: number;
    private readonly baseDelay: number;
    private readonly maxDelay: number;
    readonly account: AccountResource;
    readonly devices: DevicesResource;
    readonly messages: MessageResource;

    constructor(config: SDKConfig) {
        if(!config.apiKey || !config.secretKey) {
            throw new Error('apiKey and secretKey are required');
        }

        this.apiKey = config.apiKey;
        this.secretKey = config.secretKey;
        this.baseUrl = config.baseUrl ?? 'https://waberes.fredoronan.web.id';
        this.timeout = config.timeout ?? 10_000;
        this.maxAttempts = config.retry?.maxAttempts ?? 3;
        this.baseDelay   = config.retry?.baseDelay   ?? 1_000;
        this.maxDelay    = config.retry?.maxDelay    ?? 30_000;

        this.account = new AccountResource(this);
        this.devices = new DevicesResource(this);
        this.messages = new MessageResource(this);
    }

    async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
        const shouldRetry = options.retry ?? true;
        const maxAttempts = shouldRetry ? this.maxAttempts : 1;

        let lastError: unknown;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                return await this.doRequest<T>(path, options);
            } catch (err) {
                lastError = err;

                const isRetryable = this.isRetryableError(err);
                const isLastAttempt = attempt === maxAttempts - 1;

                if (!isRetryable || isLastAttempt) throw err;

                // Kalau RateLimitError, hormati Retry-After dari server
                const delay = err instanceof RateLimitError && err.retryAfter
                    ? err.retryAfter * 1000
                    : calcDelay(attempt, this.baseDelay, this.maxDelay);

                await sleep(delay);
            }
        }

        throw lastError;
    }

    private async doRequest<T>(path: string, options: RequestOptions): Promise<T> {
        const method  = options.method ?? 'GET';
        const bodyStr = options.body ? JSON.stringify(options.body) : '';

        const { signature, timestamp } = await signRequest(
            method, path, bodyStr, this.secretKey
        );

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);

        try {
            const res = await fetch(`${this.baseUrl}${path}`, {
                method,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key':    this.apiKey,
                    'X-Signature':  signature,
                    'X-Timestamp':  timestamp,
                    ...options.headers,
                },
                body: bodyStr || undefined,
            });

            return await this.handleResponse<T>(res);
        } finally {
            clearTimeout(timer);
        }
    }

    private isRetryableError(err: unknown): boolean {
        if (err instanceof RateLimitError) return true;
        if (err instanceof APIError) return RETRYABLE_STATUSES.has(err.status);
        // Network error / timeout (AbortError)
        if (err instanceof Error && err.name === 'AbortError') return true;
        return false;
    }

    private async handleResponse<T>(res: Response): Promise<T> {
        if (res.ok) {
            const result = await res.json();
            return result.data as Promise<T>;
        };
        
        const err = await res.json().catch(() => ({})) as Record<string, string>;

        switch (res.status) {
            case 400: throw new BadRequestError(err.error);
            case 401: throw new AuthError(err.error);
            case 403: throw new ForbiddenError(err.error);
            case 404: throw new NotFoundError(err.error);
            case 406: throw new UnacceptableError(err.error);
            case 409: throw new ConflictError(err.error);
            case 429: throw new RateLimitError(Number(res.headers.get('Retry-After')) || undefined);
            case 500: throw new InternalServerError(err.error);
            case 501: throw new NotImplementedError(err.error);
            default:  throw new APIError(res.status, err.code ?? 'API_ERROR', err.error ?? 'Unknown error');
        }
    }


    get<T>(path: string, headers = {}) { return this.request<T>(path, { method: 'GET', headers: {...headers} }); }
    post<T>(path: string, body: unknown, headers = {}) { return this.request<T>(path, { method: 'POST', headers: {...headers}, body: body }); } 
    put<T>(path: string, body: unknown, headers = {}) { return this.request<T>(path, { method: 'PUT', headers: {...headers}, body: body }); }
    delete<T>(path: string, headers = {}) { return this.request<T>(path, { method: 'DELETE', headers: {...headers} }); }
}