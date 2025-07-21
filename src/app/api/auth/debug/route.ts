import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    let profile = null;
    let profileError = null;
    
    if (user) {
      // Try to get profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      profile = data;
      profileError = error;
    }
    
    // Also check if there are any Shopify connections for this user
    let shopifyConnections = null;
    if (user) {
      const { data } = await supabase
        .from('shopify_connections')
        .select('id, shop_domain, created_at, is_active')
        .eq('user_id', user.id);
      
      shopifyConnections = data;
    }
    
    return NextResponse.json({
      auth: {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        userError: userError?.message
      },
      profile: {
        hasProfile: !!profile,
        profileData: profile,
        profileError: profileError?.message
      },
      shopify: {
        connections: shopifyConnections,
        connectionCount: shopifyConnections?.length || 0
      },
      debug: {
        timestamp: new Date().toISOString(),
        headers: {
          cookie: request.headers.get('cookie')?.substring(0, 50) + '...',
          authorization: !!request.headers.get('authorization')
        }
      }
    });

  } catch (error) {
    console.error('Auth debug error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}