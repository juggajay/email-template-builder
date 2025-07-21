import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Use service role to bypass RLS and see all users
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 });
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Get the user ID from query params
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('id');
    const email = searchParams.get('email');
    
    let userData = null;
    let profileData = null;
    let betaInvites = null;
    
    if (userId) {
      // Get user by ID
      const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (!userError) {
        userData = user;
      }
      
      // Get profile
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      profileData = profile;
    } else if (email) {
      // Get user by email
      const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      if (!usersError) {
        userData = users.users.find(u => u.email === email);
      }
    }
    
    // Get recent signups (last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentUsers } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 50
    });
    
    const recentSignups = recentUsers?.users.filter(u => 
      u.created_at && new Date(u.created_at) > new Date(tenMinutesAgo)
    ) || [];
    
    // Get beta invites
    const { data: invites } = await supabaseAdmin
      .from('beta_invites')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    betaInvites = invites;
    
    return NextResponse.json({
      searchedUser: userData ? {
        id: 'user' in userData ? userData.user.id : userData.id,
        email: 'user' in userData ? userData.user.email : userData.email,
        emailConfirmed: 'user' in userData ? userData.user.email_confirmed_at : userData.email_confirmed_at,
        createdAt: 'user' in userData ? userData.user.created_at : userData.created_at,
        lastSignIn: 'user' in userData ? userData.user.last_sign_in_at : userData.last_sign_in_at,
        confirmationSentAt: 'user' in userData ? userData.user.confirmation_sent_at : userData.confirmation_sent_at,
        profile: profileData
      } : null,
      recentSignups: recentSignups.map(u => ({
        id: u.id,
        email: u.email,
        createdAt: u.created_at,
        emailConfirmed: u.email_confirmed_at,
        confirmationSent: u.confirmation_sent_at
      })),
      betaInvites: betaInvites?.slice(0, 5) || [],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json(
      { error: 'Check failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}