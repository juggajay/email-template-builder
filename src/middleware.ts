import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/templates',
  '/analytics',
  '/settings',
  '/billing',
  '/community',
  '/admin',
  '/api/templates',
  '/api/export',
  '/api/upload',
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth',
  '/api/auth',
  '/api/stripe/webhooks',
];

export async function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Create response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Check if route requires authentication
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  
  // Perform authentication check for protected routes
  if (isProtectedRoute && !isPublicRoute) {
    try {
      // Create a Supabase client configured for middleware
      const supabase = createMiddlewareClient({ req: request, res: response });
      
      // Check if we have a session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // Redirect to login if no valid session
      if (error || !session) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }
      
      // Add user ID to request headers for downstream use
      requestHeaders.set('x-user-id', session.user.id);
    } catch (error) {
      // Log auth check error (without sensitive data)
      console.error('[Middleware] Auth check failed');
      
      // Redirect to login on auth errors
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Security headers
  const headers = response.headers;
  
  // Check if this is a Shopify app route that needs to be embedded
  const isShopifyApp = request.nextUrl.pathname.startsWith('/app/') || 
                      request.nextUrl.pathname.startsWith('/shopify-app');
  
  // Prevent clickjacking attacks (except for Shopify app pages)
  if (!isShopifyApp) {
    headers.set('X-Frame-Options', 'DENY');
  }
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection (legacy browsers)
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (formerly Feature Policy)
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  const frameAncestors = isShopifyApp 
    ? "frame-ancestors https://admin.shopify.com https://*.myshopify.com"
    : "frame-ancestors 'none'";
    
  // Generate nonce for inline scripts
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://editor.unlayer.com https://*.stripe.com https://*.supabase.co`,
    `style-src 'self' 'nonce-${nonce}' https://editor.unlayer.com https://fonts.googleapis.com`,
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://*.supabase.co https://*.stripe.com https://editor.unlayer.com wss://*.supabase.co https://api.emailjs.com",
    "frame-src 'self' https://editor.unlayer.com https://*.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    frameAncestors,
    "upgrade-insecure-requests"
  ].join('; ');
  
  // Enable CSP enforcement for production, report-only for development
  if (process.env.NODE_ENV === 'production') {
    headers.set('Content-Security-Policy', csp);
  } else {
    headers.set('Content-Security-Policy-Report-Only', csp);
  }
  
  // Add nonce to response for inline scripts
  headers.set('X-Nonce', nonce);
  
  // Strict Transport Security (HSTS) - only for production
  if (process.env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Remove powered-by header
  headers.delete('X-Powered-By');
  
  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}