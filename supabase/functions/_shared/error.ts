// Central Error Response Helper matching Lumina AppErrorResponse contract
import { corsHeaders } from './cors.ts';

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
  | 'INTERNAL_ERROR';

export function createErrorResponse(
  code: ErrorCode,
  message: string,
  status = 400,
  details?: Record<string, unknown>
): Response {
  return new Response(
    JSON.stringify({
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}
