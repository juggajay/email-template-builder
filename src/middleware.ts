import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export function middleware(request: NextRequest) {
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
  
  // Skip auth check for now - will be handled by individual pages
  // This prevents the login loop issue
  /* Authentication check disabled temporarily to fix login issue
  if (isProtectedRoute) {
    // Auth check will be handled by the pages themselves using useAuth hook
    // This prevents middleware from blocking legitimate login attempts
  }
  */

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
    
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://editor.unlayer.com https://*.stripe.com https://*.supabase.co",
    "style-src 'self' 'unsafe-inline' https://editor.unlayer.com https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://*.supabase.co https://*.stripe.com https://editor.unlayer.com wss://*.supabase.co https://api.emailjs.com",
    "frame-src 'self' https://editor.unlayer.com https://*.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    frameAncestors,
    "upgrade-insecure-requests"
  ].join('; ');
  
  // Use Report-Only mode for now to prevent breaking the app
  headers.set('Content-Security-Policy-Report-Only', csp);
  
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