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
    const { 
      to, 
      subject, 
      html, 
      templateData, 
      provider, 
      trackOpens = true, 
      trackClicks = true 
    } = body;

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' }, 
        { status: 400 }
      );
    }

    const emailService = getEmailService();
    
    const result = await emailService.sendEmail({
      from: {
        email: process.env.DEFAULT_FROM_EMAIL || 'noreply@example.com',
        name: process.env.DEFAULT_FROM_NAME || 'Email Template Builder'
      },
      to: Array.isArray(to) ? to : [{ email: to }],
      content: {
        subject,
        html
      },
      templateData,
      trackOpens,
      trackClicks,
      tags: {
        user_id: user.id,
        source: 'template_builder'
      }
    }, provider);

    // Store email record in database
    await supabase
      .from('sent_emails')
      .insert({
        user_id: user.id,
        email_id: result.id,
        provider: result.provider,
        recipient: Array.isArray(to) ? to[0].email || to[0] : to,
        subject,
        status: result.status,
        sent_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      emailId: result.id,
      status: result.status,
      provider: result.provider
    });

  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' }, 
      { status: 500 }
    );
  }
}