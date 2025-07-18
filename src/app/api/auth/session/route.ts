import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { withRateLimit, rateLimiters } from '@/lib/security/rate-limit';
import { handleApiError, withErrorHandling } from '@/lib/security/error-handling';
import { logSecurityEvent, SecurityEventType, extractRequestMetadata } from '@/lib/security/monitoring';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await withRateLimit(request, rateLimiters.auth);
  if (rateLimitResult) return rateLimitResult;

  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session error:', error);
      return NextResponse.json(
        { error: 'Failed to get session' },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { session: null },
        { status: 200 }
      );
    }

    // Log successful session retrieval
    await logSecurityEvent({
      type: SecurityEventType.LOGIN_SUCCESS,
      userId: session.user.id,
      ...extractRequestMetadata(request),
      result: 'success'
    });

    return NextResponse.json({
      session: {
        access_token: session.access_token,
        token_type: session.token_type,
        expires_at: session.expires_at,
        user: {
          id: session.user.id,
          email: session.user.email,
          app_metadata: session.user.app_metadata,
          user_metadata: session.user.user_metadata,
          created_at: session.user.created_at
        }
      }
    });
  } catch (error) {
    return handleApiError(error, { 
      action: 'get_session',
      ...extractRequestMetadata(request)
    });
  }
}

export async function DELETE(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await withRateLimit(request, rateLimiters.auth);
  if (rateLimitResult) return rateLimitResult;

  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user before signing out
    const { data: { user } } = await supabase.auth.getUser();
    
    // Sign out the user
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      return NextResponse.json(
        { error: 'Failed to sign out' },
        { status: 500 }
      );
    }

    // Log successful logout
    if (user) {
      await logSecurityEvent({
        type: SecurityEventType.LOGOUT,
        userId: user.id,
        ...extractRequestMetadata(request),
        result: 'success'
      });
    }

    return NextResponse.json(
      { message: 'Successfully signed out' },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, { 
      action: 'sign_out',
      ...extractRequestMetadata(request)
    });
  }
}