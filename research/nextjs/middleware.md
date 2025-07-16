# Next.js 14 Middleware Guide

## Introduction

Middleware in Next.js allows you to run code before a request is completed, enabling powerful request and response modifications. It's perfect for authentication, logging, and custom routing logic.

## Basic Middleware Setup

```typescript
// middleware.ts (in the root of your project)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Your middleware logic here
  console.log('Middleware running for:', request.nextUrl.pathname)
  
  return NextResponse.next()
}

// Configure which paths middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

## Authentication Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the path requires authentication
  const protectedPaths = ['/dashboard', '/templates', '/editor']
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  )
  
  if (isProtectedPath) {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      // Verify token
      const payload = await verifyToken(token)
      
      // Add user info to headers for downstream use
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.userId)
      requestHeaders.set('x-user-email', payload.email)
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
      
    } catch (error) {
      // Invalid token - redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth-token')
      return response
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|signup).*)',
  ],
}
```

## API Route Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Protect API routes
  if (pathname.startsWith('/api/protected/')) {
    const apiKey = request.headers.get('x-api-key')
    
    if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }
  
  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // Implement rate limiting logic here
    if (await isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
  }
  
  return NextResponse.next()
}
```

## Role-Based Access Control

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserRole } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Admin-only routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      const userRole = await getUserRole(token)
      
      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
      
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}
```

## Request/Response Modification

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add custom headers
  response.headers.set('x-custom-header', 'value')
  response.headers.set('x-timestamp', Date.now().toString())
  
  // Add security headers
  response.headers.set('x-frame-options', 'DENY')
  response.headers.set('x-content-type-options', 'nosniff')
  response.headers.set('referrer-policy', 'origin-when-cross-origin')
  
  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('access-control-allow-origin', '*')
    response.headers.set('access-control-allow-methods', 'GET, POST, PUT, DELETE')
    response.headers.set('access-control-allow-headers', 'Content-Type, Authorization')
  }
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: response.headers })
  }
  
  return response
}
```

## Feature Flags

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Feature flag for beta features
  if (pathname.startsWith('/beta')) {
    const betaEnabled = request.cookies.get('beta-features')?.value === 'true'
    
    if (!betaEnabled) {
      return NextResponse.redirect(new URL('/coming-soon', request.url))
    }
  }
  
  // A/B testing
  if (pathname === '/landing') {
    const variant = request.cookies.get('ab-test-variant')?.value
    
    if (!variant) {
      // Assign random variant
      const newVariant = Math.random() < 0.5 ? 'a' : 'b'
      const response = NextResponse.rewrite(
        new URL(`/landing-${newVariant}`, request.url)
      )
      response.cookies.set('ab-test-variant', newVariant, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
      return response
    }
    
    return NextResponse.rewrite(
      new URL(`/landing-${variant}`, request.url)
    )
  }
  
  return NextResponse.next()
}
```

## Email Template Builder Specific Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Template editor protection
  if (pathname.startsWith('/editor/')) {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Extract template ID from URL
    const templateId = pathname.split('/editor/')[1]
    
    // Check if user has access to this template
    try {
      const hasAccess = await checkTemplateAccess(token, templateId)
      
      if (!hasAccess) {
        return NextResponse.redirect(new URL('/templates', request.url))
      }
      
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // API rate limiting for email sending
  if (pathname.startsWith('/api/send-email')) {
    const userId = request.headers.get('x-user-id')
    
    if (userId) {
      const emailsSentToday = await getEmailsSentToday(userId)
      const dailyLimit = await getUserEmailLimit(userId)
      
      if (emailsSentToday >= dailyLimit) {
        return NextResponse.json(
          { error: 'Daily email limit exceeded' },
          { status: 429 }
        )
      }
    }
  }
  
  return NextResponse.next()
}

// Helper functions (implement these based on your database)
async function checkTemplateAccess(token: string, templateId: string): Promise<boolean> {
  // Verify user owns or has access to template
  return true // Implement your logic
}

async function getEmailsSentToday(userId: string): Promise<number> {
  // Count emails sent today by user
  return 0 // Implement your logic
}

async function getUserEmailLimit(userId: string): Promise<number> {
  // Get user's daily email limit
  return 100 // Implement your logic
}
```

## Advanced Patterns

### Conditional Redirects
```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''
  
  // Mobile-specific redirects
  if (pathname === '/dashboard' && userAgent.includes('Mobile')) {
    return NextResponse.redirect(new URL('/mobile-dashboard', request.url))
  }
  
  // Maintenance mode
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'
  if (maintenanceMode && !pathname.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }
  
  return NextResponse.next()
}
```

### Geolocation-Based Logic
```typescript
export function middleware(request: NextRequest) {
  const country = request.geo?.country || 'US'
  const { pathname } = request.nextUrl
  
  // Redirect EU users to GDPR-compliant version
  const euCountries = ['DE', 'FR', 'IT', 'ES', 'NL'] // etc.
  if (euCountries.includes(country) && !pathname.startsWith('/eu')) {
    return NextResponse.redirect(new URL(`/eu${pathname}`, request.url))
  }
  
  return NextResponse.next()
}
```

## Best Practices

1. **Keep middleware lightweight** - Avoid heavy computations
2. **Use appropriate matchers** - Only run middleware where needed
3. **Handle errors gracefully** - Always have fallback logic
4. **Cache expensive operations** - Use Redis or similar for rate limiting
5. **Log important events** - For debugging and monitoring
6. **Test thoroughly** - Middleware affects all matching routes
7. **Use TypeScript** - For better type safety
8. **Avoid database calls when possible** - Use JWT tokens with embedded data
9. **Set appropriate cache headers** - For performance optimization
10. **Monitor performance** - Middleware adds latency to requests

## Configuration Options

```typescript
export const config = {
  // Match specific paths
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
  
  // Runtime configuration (Edge is faster)
  runtime: 'edge', // or 'nodejs'
  
  // Regions (for Edge runtime)
  regions: ['iad1', 'sfo1'], // Optional: specify regions
}
```

This middleware setup provides a robust foundation for handling authentication, authorization, rate limiting, and custom routing logic in your Next.js email template builder application.