// Standard Lumina Error Normalization matching ARCHITECTURE.md §6

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_REVOKED'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'RATE_LIMITED'
  | 'NETWORK_OFFLINE'
  | 'INTERNAL_ERROR';

export interface AppErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
  };
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    const customErr = error as { code: string; message: string; details?: Record<string, unknown> };
    return new AppError(
      (customErr.code as ErrorCode) || 'INTERNAL_ERROR',
      customErr.message || 'An unexpected error occurred',
      customErr.details
    );
  }

  if (error instanceof Error) {
    if (error.message.toLowerCase().includes('failed to fetch') || !navigator.onLine) {
      return new AppError(
        'NETWORK_OFFLINE',
        'You are currently offline. Please reconnect to continue.'
      );
    }
    return new AppError('INTERNAL_ERROR', error.message);
  }

  return new AppError('INTERNAL_ERROR', 'An unknown error occurred');
}
