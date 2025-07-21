import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { emailId: string } }
) {
  try {
    const emailId = params.emailId;
    const url = request.nextUrl.searchParams.get('url');
    const userAgent = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.ip || '';

    if (!url) {
      return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
    }

    const supabase = createClient();

    // Record click event
    await supabase
      .from('email_events')
      .insert({
        event_id: `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email_id: emailId,
        event_type: 'clicked',
        recipient: '', // We might not have this from click tracking
        timestamp: new Date().toISOString(),
        provider: 'tracking',
        user_agent: userAgent,
        ip_address: ipAddress,
        link_url: url,
        metadata: {
          tracking_type: 'click',
          original_url: url,
          timestamp: Date.now()
        }
      });

    // Redirect to original URL
    return NextResponse.redirect(url);

  } catch (error) {
    console.error('Track click error:', error);
    
    // Still redirect to URL even if tracking fails
    const url = request.nextUrl.searchParams.get('url');
    if (url) {
      return NextResponse.redirect(url);
    }
    
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
  }
}