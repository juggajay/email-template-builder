/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse and DoS attacks
 */

import { NextRequest } from 'next/server';

// In-memory store for rate limiting (consider Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((value, key) => {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  });
}, 60000); // Clean every minute

export interface RateLimitConfig {
  windowMs?: number; // Time window in milliseconds
  maxRequests?: number; // Maximum requests per window
  identifier?: (req: NextRequest) => string; // Function to identify client
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  message?: string; // Error message
}

const defaultConfig: Required<RateLimitConfig> = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  identifier: (req) => {
    // Try to get IP from various headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
    return ip;
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  message: 'Too many requests, please try again later.'
};

export function createRateLimiter(config?: RateLimitConfig) {
  const finalConfig = { ...defaultConfig, ...config };

  return async function rateLimit(req: NextRequest): Promise<{ success: boolean; limit: number; remaining: number; reset: Date } | null> {
    const identifier = finalConfig.identifier(req);
    const now = Date.now();
    const windowStart = now - finalConfig.windowMs;

    // Get or create rate limit data
    let limitData = rateLimitStore.get(identifier);
    
    if (!limitData || limitData.resetTime < now) {
      limitData = {
        count: 0,
        resetTime: now + finalConfig.windowMs
      };
      rateLimitStore.set(identifier, limitData);
    }

    // Increment counter
    limitData.count++;

    // Check if limit exceeded
    const success = limitData.count <= finalConfig.maxRequests;
    const remaining = Math.max(0, finalConfig.maxRequests - limitData.count);
    const reset = new Date(limitData.resetTime);

    return {
      success,
      limit: finalConfig.maxRequests,
      remaining,
      reset
    };
  };
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // Standard API rate limit
  api: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60 // 60 requests per minute
  }),

  // Strict rate limit for authentication endpoints
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 attempts per 15 minutes
  }),

  // Email sending rate limit
  email: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50 // 50 emails per hour
  }),

  // Webhook rate limit
  webhook: createRateLimiter({
    windowMs: 1000, // 1 second
    maxRequests: 10 // 10 requests per second
  }),

  // Export/download rate limit
  export: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20 // 20 exports per hour
  })
};

// Helper function to apply rate limiting to API routes
export async function withRateLimit(
  req: NextRequest,
  rateLimiter = rateLimiters.api
): Promise<Response | null> {
  const result = await rateLimiter(req);
  
  if (!result || !result.success) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: result?.reset || new Date(Date.now() + 60000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(result?.limit || 60),
          'X-RateLimit-Remaining': String(result?.remaining || 0),
          'X-RateLimit-Reset': String(result?.reset?.getTime() || Date.now() + 60000),
          'Retry-After': String(Math.ceil((result?.reset?.getTime() || Date.now() + 60000 - Date.now()) / 1000))
        }
      }
    );
  }

  return null; // Continue with request
}