import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/supabase/types';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard';
  const type = requestUrl.searchParams.get('type');

  console.log('[Auth Callback] Params:', { code: !!code, next, redirectTo, type });

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('[Auth Callback] Session exchange error:', error);
        return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url));
      }

      console.log('[Auth Callback] Session established for user:', data.user?.id);

      // Force a session refresh to ensure the client picks it up
      const { data: session } = await supabase.auth.getSession();
      console.log('[Auth Callback] Session refreshed:', !!session?.session);

      // Check if this is email confirmation
      if (type === 'signup' || type === 'email_confirmation') {
        console.log('[Auth Callback] Email confirmation flow');
        
        // Get the user's profile to check beta status
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('is_beta_tester')
          .eq('user_id', data.user.id)
          .single();

        console.log('[Auth Callback] User beta status:', profile?.is_beta_tester);

        // Add a small delay to ensure session is propagated
        await new Promise(resolve => setTimeout(resolve, 100));

        // Redirect to dashboard with a success flag
        const dashboardUrl = new URL('/dashboard', request.url);
        dashboardUrl.searchParams.set('verified', 'true');
        return NextResponse.redirect(dashboardUrl);
      }
      
      // Handle password reset flow
      if (next === '/reset-password' || type === 'recovery') {
        return NextResponse.redirect(new URL('/reset-password', request.url));
      }
      
      // Handle magic link login
      if (type === 'magiclink') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      console.error('[Auth Callback] Unexpected error:', error);
      return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url));
    }
  } else {
    console.error('[Auth Callback] No code provided');
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  // Default redirect
  return NextResponse.redirect(new URL(redirectTo, request.url));
}