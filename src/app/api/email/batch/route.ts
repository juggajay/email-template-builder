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
      emails, 
      provider, 
      batchSize = 100, 
      delayBetweenBatches = 1000 
    } = body;

    // Validate required fields
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid emails array' }, 
        { status: 400 }
      );
    }

    // Validate each email in the batch
    for (const email of emails) {
      if (!email.to || !email.subject || !email.html) {
        return NextResponse.json(
          { error: 'Each email must have to, subject, and html fields' }, 
          { status: 400 }
        );
      }
    }

    const emailService = getEmailService();
    
    // Convert to proper format
    const emailOptions = emails.map((email: any) => ({
      from: {
        email: process.env.DEFAULT_FROM_EMAIL || 'noreply@example.com',
        name: process.env.DEFAULT_FROM_NAME || 'Email Template Builder'
      },
      to: Array.isArray(email.to) ? email.to : [{ email: email.to }],
      content: {
        subject: email.subject,
        html: email.html,
        text: email.text
      },
      templateData: email.templateData,
      trackOpens: email.trackOpens !== false,
      trackClicks: email.trackClicks !== false,
      tags: {
        user_id: user.id,
        source: 'batch_send',
        batch_id: `batch_${Date.now()}`
      }
    }));

    const result = await emailService.sendBatch({
      emails: emailOptions,
      batchSize,
      delayBetweenBatches
    }, provider);

    // Store batch record in database
    await supabase
      .from('email_batches')
      .insert({
        user_id: user.id,
        batch_id: result.batchId,
        provider: provider || 'default',
        total_emails: result.total,
        sent_count: result.sent,
        failed_count: result.failed,
        status: result.failed === 0 ? 'completed' : 'partial',
        created_at: new Date().toISOString()
      });

    // Store individual email records
    const emailRecords = result.results.map((emailResult, index) => ({
      user_id: user.id,
      email_id: emailResult.id,
      batch_id: result.batchId,
      provider: emailResult.provider,
      recipient: emails[index]?.to || 'unknown',
      subject: emails[index]?.subject || '',
      status: emailResult.status,
      error_message: emailResult.error,
      sent_at: new Date().toISOString()
    }));

    if (emailRecords.length > 0) {
      await supabase
        .from('sent_emails')
        .insert(emailRecords);
    }

    return NextResponse.json({
      success: true,
      batchId: result.batchId,
      total: result.total,
      sent: result.sent,
      failed: result.failed,
      errors: result.errors.slice(0, 10), // Limit error details
      message: `Batch send completed: ${result.sent}/${result.total} emails sent successfully`
    });

  } catch (error) {
    console.error('Batch send error:', error);
    return NextResponse.json(
      { error: 'Failed to send batch emails' }, 
      { status: 500 }
    );
  }
}