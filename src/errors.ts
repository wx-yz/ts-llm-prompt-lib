// src/errors.ts
export class ApiError extends Error {
    readonly provider: string;
    readonly statusCode: number;
    readonly details?: any; // To hold parsed error body from API

    constructor(provider: string, statusCode: number, details?: any, message?: string) {
        const detailMessage = typeof details === 'string' ? details : JSON.stringify(details);
        super(message || `${provider} API Error ${statusCode}: ${detailMessage}`);
        this.name = 'ApiError';
        this.provider = provider;
        this.statusCode = statusCode;
        this.details = details;

        // Maintains proper stack trace in V8 environments (Node.js)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
}