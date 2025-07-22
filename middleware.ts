import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Get the current session
  const { data: { session }, error } = await supabase.auth.getSession();
  
  // Check if we're on a protected route
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/editor') ||
                          request.nextUrl.pathname.startsWith('/templates') ||
                          request.nextUrl.pathname.startsWith('/billing') ||
                          request.nextUrl.pathname.startsWith('/settings') ||
                          request.nextUrl.pathname.startsWith('/analytics');
  
  // If the route is protected and there's no session, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If there's a session but it's about to expire (within 5 minutes), try to refresh
  if (session && session.expires_at) {
    const expiresAt = session.expires_at * 1000; // Convert to milliseconds
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (expiresAt - now < fiveMinutes) {
      // Attempt to refresh the session
      const { data: { session: refreshedSession }, error: refreshError } = 
        await supabase.auth.refreshSession();
      
      if (refreshError || !refreshedSession) {
        // If refresh fails on a protected route, redirect to login
        if (isProtectedRoute) {
          const redirectUrl = new URL('/login', request.url);
          redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
          return NextResponse.redirect(redirectUrl);
        }
      }
    }
  }
  
  // Check if user is trying to access auth pages while logged in
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                    request.nextUrl.pathname.startsWith('/signup');
  
  if (isAuthPage && session) {
    // Redirect to dashboard if already logged in
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (we handle those separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};