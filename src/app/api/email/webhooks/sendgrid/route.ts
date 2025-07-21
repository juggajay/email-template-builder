import { NextRequest, NextResponse } from 'next/server';
import { getEmailService } from '@/lib/email/email-service';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-twilio-email-event-webhook-signature');
    const payload = await request.json();

    const emailService = getEmailService();
    
    // Process webhook events
    const events = await emailService.handleWebhook(payload, 'sendgrid', signature || undefined);

    const supabase = createClient();

    // Store events in database
    for (const event of events) {
      await supabase
        .from('email_events')
        .insert({
          event_id: event.id,
          email_id: event.emailId,
          event_type: event.type,
          recipient: event.recipient,
          timestamp: event.timestamp.toISOString(),
          provider: 'sendgrid',
          metadata: event.metadata,
          user_agent: event.userAgent,
          ip_address: event.ipAddress,
          link_url: event.link,
          reason: event.reason,
          location: event.location ? JSON.stringify(event.location) : null
        });

      // Update email status in sent_emails table
      if (event.type === 'bounced' || event.type === 'complained') {
        await supabase
          .from('sent_emails')
          .update({ 
            status: event.type === 'bounced' ? 'bounced' : 'complained',
            updated_at: new Date().toISOString()
          })
          .eq('email_id', event.emailId);
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: events.length 
    });

  } catch (error) {
    console.error('SendGrid webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { status: 500 }
    );
  }
}