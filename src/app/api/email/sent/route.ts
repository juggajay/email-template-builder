import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status');
    const provider = url.searchParams.get('provider');

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('sent_emails')
      .select('*')
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (provider && provider !== 'all') {
      query = query.eq('provider', provider);
    }

    const { data: emails, error, count } = await query;

    if (error) {
      throw error;
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('sent_emails')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    if (provider && provider !== 'all') {
      countQuery = countQuery.eq('provider', provider);
    }

    const { count: totalCount } = await countQuery;

    return NextResponse.json({
      emails: emails?.map(email => ({
        id: email.id,
        emailId: email.email_id,
        subject: email.subject,
        recipient: email.recipient,
        provider: email.provider,
        status: email.status,
        sentAt: email.sent_at,
        isTest: email.is_test || false
      })) || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Get sent emails error:', error);
    return NextResponse.json(
      { error: 'Failed to get sent emails' }, 
      { status: 500 }
    );
  }
}