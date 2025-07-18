/**
 * Secure Error Handling
 * Prevents information disclosure through error messages
 */

import { NextResponse } from 'next/server';

// Error types that are safe to expose to users
export enum SafeErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  CONFLICT = 'CONFLICT_ERROR',
  BAD_REQUEST = 'BAD_REQUEST_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE_ERROR'
}

// Map internal errors to safe external messages
const errorMessages: Record<SafeErrorType, string> = {
  [SafeErrorType.VALIDATION]: 'Invalid input provided',
  [SafeErrorType.AUTHENTICATION]: 'Authentication required',
  [SafeErrorType.AUTHORIZATION]: 'You do not have permission to perform this action',
  [SafeErrorType.RATE_LIMIT]: 'Too many requests, please try again later',
  [SafeErrorType.NOT_FOUND]: 'The requested resource was not found',
  [SafeErrorType.CONFLICT]: 'The request conflicts with the current state',
  [SafeErrorType.BAD_REQUEST]: 'Invalid request',
  [SafeErrorType.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable'
};

// HTTP status codes for error types
const statusCodes: Record<SafeErrorType, number> = {
  [SafeErrorType.VALIDATION]: 400,
  [SafeErrorType.AUTHENTICATION]: 401,
  [SafeErrorType.AUTHORIZATION]: 403,
  [SafeErrorType.RATE_LIMIT]: 429,
  [SafeErrorType.NOT_FOUND]: 404,
  [SafeErrorType.CONFLICT]: 409,
  [SafeErrorType.BAD_REQUEST]: 400,
  [SafeErrorType.SERVICE_UNAVAILABLE]: 503
};

export class SafeError extends Error {
  constructor(
    public type: SafeErrorType,
    public safeMessage: string = errorMessages[type],
    public statusCode: number = statusCodes[type],
    public details?: any
  ) {
    super(safeMessage);
    this.name = 'SafeError';
  }
}

// Log errors securely (sanitize sensitive data)
export function logError(error: any, context?: Record<string, any>) {
  const sanitizedError = {
    message: error.message || 'Unknown error',
    type: error.name || 'Error',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    context: sanitizeContext(context)
  };

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to Sentry, LogRocket, etc.
    console.error('[ERROR]', JSON.stringify(sanitizedError));
  } else {
    console.error('[ERROR]', sanitizedError);
  }
}

// Sanitize context data to remove sensitive information
function sanitizeContext(context?: Record<string, any>): Record<string, any> {
  if (!context) return {};

  const sanitized: Record<string, any> = {};
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];

  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    
    // Check if key contains sensitive data
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeContext(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// Handle API errors consistently
export function handleApiError(error: any, context?: Record<string, any>): NextResponse {
  // Log the full error internally
  logError(error, context);

  // Handle known safe errors
  if (error instanceof SafeError) {
    return NextResponse.json(
      {
        error: error.type,
        message: error.safeMessage,
        details: error.details
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    return NextResponse.json(
      {
        error: SafeErrorType.VALIDATION,
        message: 'Validation failed',
        details: process.env.NODE_ENV === 'development' ? error.errors : undefined
      },
      { status: 400 }
    );
  }

  // Handle database errors
  if (error.code === '23505') { // Unique constraint violation
    return NextResponse.json(
      {
        error: SafeErrorType.CONFLICT,
        message: 'Resource already exists'
      },
      { status: 409 }
    );
  }

  if (error.code === '23503') { // Foreign key violation
    return NextResponse.json(
      {
        error: SafeErrorType.BAD_REQUEST,
        message: 'Invalid reference'
      },
      { status: 400 }
    );
  }

  // Default error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  return NextResponse.json(
    {
      error: 'INTERNAL_ERROR',
      message: isDevelopment ? error.message : 'An unexpected error occurred',
      stack: isDevelopment ? error.stack : undefined
    },
    { status: 500 }
  );
}

// Wrap async route handlers with error handling
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// Create standardized API responses
export const apiResponse = {
  success: <T>(data: T, message?: string) => 
    NextResponse.json({
      success: true,
      message,
      data
    }),

  error: (error: SafeErrorType, message?: string, statusCode?: number) => 
    NextResponse.json(
      {
        success: false,
        error,
        message: message || errorMessages[error]
      },
      { status: statusCode || statusCodes[error] }
    ),

  paginated: <T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    }
  ) => 
    NextResponse.json({
      success: true,
      data,
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page * pagination.limit < pagination.total,
        hasPrev: pagination.page > 1
      }
    })
};