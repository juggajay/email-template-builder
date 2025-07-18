import { NextRequest, NextResponse } from 'next/server';
import { getEmailService } from '@/lib/email/email-service';
import { createClient } from '@/lib/supabase/server';
import { withRateLimit, rateLimiters } from '@/lib/security/rate-limit';
import { handleApiError, SafeError, SafeErrorType } from '@/lib/security/error-handling';
import { validateRequestBody, schemas, sanitizeHtml } from '@/lib/security/validation';
import { logSecurityEvent, SecurityEventType, extractRequestMetadata } from '@/lib/security/monitoring';
import { z } from 'zod';

// Define email request schema
const sendEmailSchema = z.object({
  to: z.union([
    schemas.email,
    z.array(z.union([
      schemas.email,
      z.object({ email: schemas.email, name: z.string().optional() })
    ]))
  ]),
  subject: z.string().min(1).max(200),
  html: z.string().min(1).max(1000000),
  templateData: z.record(z.any()).optional(),
  provider: z.string().optional(),
  trackOpens: z.boolean().default(true),
  trackClicks: z.boolean().default(true)
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await withRateLimit(request, rateLimiters.email);
  if (rateLimitResult) return rateLimitResult;

  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const { data: validatedData, error: validationError } = await validateRequestBody(
      request,
      sendEmailSchema
    );

    if (validationError) {
      throw new SafeError(
        SafeErrorType.VALIDATION,
        validationError
      );
    }

    const { to, subject, html, templateData, provider, trackOpens, trackClicks } = validatedData!;

    // Sanitize HTML content
    const sanitizedHtml = sanitizeHtml(html);

    const emailService = getEmailService();
    
    const result = await emailService.sendEmail({
      from: {
        email: process.env.DEFAULT_FROM_EMAIL || 'noreply@example.com',
        name: process.env.DEFAULT_FROM_NAME || 'Email Template Builder'
      },
      to: Array.isArray(to) 
        ? to.map((recipient: any) => 
            typeof recipient === 'string' 
              ? { email: recipient } 
              : recipient
          )
        : [{ email: to }],
      content: {
        subject,
        html: sanitizedHtml
      },
      templateData,
      trackOpens,
      trackClicks,
      tags: {
        user_id: user.id,
        source: 'template_builder'
      }
    }, provider as any);

    // Store email record in database
    await supabase
      .from('sent_emails')
      .insert({
        user_id: user.id,
        email_id: result.id,
        provider: result.provider,
        recipient: Array.isArray(to) 
          ? (typeof to[0] === 'string' ? to[0] : to[0].email)
          : to,
        subject,
        status: result.status,
        sent_at: new Date().toISOString()
      });

    // Log successful email send
    await logSecurityEvent({
      type: SecurityEventType.DATA_EXPORT,
      userId: user.id,
      ...extractRequestMetadata(request),
      action: 'send_email',
      result: 'success',
      metadata: {
        recipient: Array.isArray(to) ? to[0] : to,
        provider: result.provider
      }
    });

    return NextResponse.json({
      success: true,
      emailId: result.id,
      status: result.status,
      provider: result.provider
    });

  } catch (error) {
    // Log failed email attempt
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await logSecurityEvent({
        type: SecurityEventType.DATA_EXPORT,
        userId: user.id,
        ...extractRequestMetadata(request),
        action: 'send_email',
        result: 'failure',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }

    return handleApiError(error, {
      action: 'send_email',
      ...extractRequestMetadata(request)
    });
  }
}