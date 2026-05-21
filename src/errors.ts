export class APIError extends Error {
    constructor(
        public status: number,
        public code: string,
        message: string
    ) {
        super(message);
        this.name = 'APIError';
    }
}

export class AuthError extends APIError {
    constructor(message = 'Unauthorized') {
        super(401, 'UNAUTHORIZED', message)
        this.name = 'AuthError';
    }
}

export class RateLimitError extends APIError {
    constructor(public retryAfter?: number) {
        super(429, 'RATE_LIMITED', 'Rate limit exceeded');
        this.name = 'RateLimitError';
    }
}