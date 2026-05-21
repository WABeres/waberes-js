export interface SDKConfig {
    apiKey: string;
    secretKey: string;
    baseUrl?: string;
    timeout?: number;
    retry?: {
        maxAttempts?: number; // default: 3
        baseDelay?: number; // default: 1000ms
        maxDelay?: number; // default: 3000ms
    }
}

export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
    retry?: boolean;
}