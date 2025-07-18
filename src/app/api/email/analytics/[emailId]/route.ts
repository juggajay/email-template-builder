import { NextRequest, NextResponse } from 'next/server';
import { getEmailService } from '@/lib/email/email-service';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { emailId: string } }
) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const emailId = params.emailId;

    // Get email record to verify ownership
    const { data: emailRecord, error: emailError } = await supabase
      .from('sent_emails')
      .select('*')
      .eq('email_id', emailId)
      .eq('user_id', user.id)
      .single();

    if (emailError || !emailRecord) {
      return NextResponse.json(
        { error: 'Email not found' }, 
        { status: 404 }
      );
    }

    // Get all events for this email
    const { data: events, error: eventsError } = await supabase
      .from('email_events')
      .select('*')
      .eq('email_id', emailId)
      .order('timestamp', { ascending: true });

    if (eventsError) {
      throw eventsError;
    }

    // Calculate analytics
    const sent = events.filter(e => e.event_type === 'sent').length || 1;
    const delivered = events.filter(e => e.event_type === 'delivered').length;
    const opened = events.filter(e => e.event_type === 'opened').length;
    const clicked = events.filter(e => e.event_type === 'clicked').length;
    const bounced = events.filter(e => e.event_type === 'bounced').length;
    const complained = events.filter(e => e.event_type === 'complained').length;
    const unsubscribed = events.filter(e => e.event_type === 'unsubscribed').length;

    const analytics = {
      emailId,
      sent,
      delivered,
      opened,
      clicked,
      bounced,
      complained,
      unsubscribed,
      openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
      clickRate: delivered > 0 ? (clicked / delivered) * 100 : 0,
      bounceRate: sent > 0 ? (bounced / sent) * 100 : 0,
      complaintRate: delivered > 0 ? (complained / delivered) * 100 : 0,
      events: events.map(event => ({
        id: event.event_id,
        type: event.event_type,
        timestamp: event.timestamp,
        recipient: event.recipient,
        userAgent: event.user_agent,
        ipAddress: event.ip_address,
        link: event.link_url,
        reason: event.reason,
        location: event.location ? JSON.parse(event.location) : null,
        metadata: event.metadata
      })),
      email: {
        subject: emailRecord.subject,
        recipient: emailRecord.recipient,
        provider: emailRecord.provider,
        sentAt: emailRecord.sent_at,
        status: emailRecord.status
      }
    };

    return NextResponse.json({ analytics });

  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics' }, 
      { status: 500 }
    );
  }
}