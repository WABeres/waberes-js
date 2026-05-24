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

export class ForbiddenError extends APIError {
    constructor(message = 'Forbidden') {
        super(403, 'FORBIDDEN', message);
        this.name = 'ForbiddenError';
    }
}

export class BadRequestError extends APIError {
    constructor(message = 'Bad Request') {
        super(400, 'BAD REQUEST', message);
        this.name = 'BadRequestError';
    }
}

export class NotFoundError extends APIError {
    constructor(message = 'Not Found') {
        super(404, 'NOT FOUND', message);
        this.name = 'NotFoundError';
    }
}

export class UnacceptableError extends APIError {
    constructor(message = 'Unacceptable') {
        super(406, 'UNACCEPTABLE', message);
        this.name = 'UnacceptableError';
    }
}

export class ConflictError extends APIError {
    constructor(message = 'Conflict') {
        super(409, 'CONFLICT', message);
        this.name = 'ConflictError';
    }
}

export class InternalServerError extends APIError {
    constructor(message = 'Internal Server Error') {
        super(500, 'INTERNAL SERVER ERROR', message);
        this.name = 'InternalServerError';
    }
}

export class NotImplementedError extends APIError {
    constructor(message = 'Not Implemented') {
        super(501, 'NOT IMPLEMENTED', message);
        this.name = 'NotImplementedError';
    }
}