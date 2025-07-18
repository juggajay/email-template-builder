import { NextRequest, NextResponse } from 'next/server';
import { getEmailService } from '@/lib/email/email-service';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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