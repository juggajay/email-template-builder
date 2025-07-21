import { NextRequest, NextResponse } from 'next/server';
import { getEmailService } from '@/lib/email/email-service';
import { createClient } from '@/lib/supabase/server';

// Rate limiting constants
const MAX_TEST_EMAILS_PER_HOUR = 10;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString();
    const { data: recentEmails, error: countError } = await supabase
      .from('sent_emails')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_test', true)
      .gte('sent_at', oneHourAgo);

    if (!countError && recentEmails && recentEmails.length >= MAX_TEST_EMAILS_PER_HOUR) {
      const oldestEmail = recentEmails[0];
      const { data: emailDetails } = await supabase
        .from('sent_emails')
        .select('sent_at')
        .eq('id', oldestEmail.id)
        .single();
      
      if (emailDetails) {
        const resetTime = new Date(emailDetails.sent_at).getTime() + RATE_LIMIT_WINDOW;
        const remainingMinutes = Math.ceil((resetTime - Date.now()) / 1000 / 60);
        
        return NextResponse.json(
          { 
            error: `Test email limit reached (${MAX_TEST_EMAILS_PER_HOUR} per hour). Try again in ${remainingMinutes} minutes.`,
            rateLimited: true,
            remainingMinutes
          }, 
          { status: 429 }
        );
      }
    }

    const body = await request.json();
    const { to, html, templateData, provider } = body;

    // Validate required fields
    if (!to || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, html' }, 
        { status: 400 }
      );
    }

    const emailService = getEmailService();
    
    const result = await emailService.sendTestEmail(
      to,
      html,
      templateData,
      provider
    );

    // Store test email record
    await supabase
      .from('sent_emails')
      .insert({
        user_id: user.id,
        email_id: result.id,
        provider: result.provider,
        recipient: to,
        subject: 'Test Email - Template Preview',
        status: result.status,
        is_test: true,
        sent_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      emailId: result.id,
      status: result.status,
      provider: result.provider,
      message: result.status === 'sent' 
        ? 'Test email sent successfully' 
        : 'Test email failed to send'
    });

  } catch (error) {
    console.error('Send test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' }, 
      { status: 500 }
    );
  }
}