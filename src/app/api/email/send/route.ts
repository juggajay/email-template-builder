import { NextRequest, NextResponse } from 'next/server';
import { getEmailService } from '@/lib/email/email-service';
import { createClient } from '@/lib/supabase/server';
import { withRateLimit, rateLimiters } from '@/lib/security/rate-limit';
import { handleApiError, SafeError, SafeErrorType } from '@/lib/security/error-handling';
import { validateRequestBody, schemas, sanitizeHtml } from '@/lib/security/validation';
import { logSecurityEvent, SecurityEventType, extractRequestMetadata } from '@/lib/security/monitoring';
import { processEmailImages } from '@/lib/email/image-processor-fixed';
import { transformImageUrls } from '@/lib/email/image-url-transformer';
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

    // Log original HTML details
    console.log('[Email Send] Original HTML length:', html.length);
    console.log('[Email Send] Original HTML contains <img>:', html.includes('<img'));
    console.log('[Email Send] Original HTML img count:', (html.match(/<img/g) || []).length);
    
    // Sanitize HTML content
    const sanitizedHtml = sanitizeHtml(html);
    console.log('[Email Send] After sanitization - HTML length:', sanitizedHtml.length);
    console.log('[Email Send] After sanitization - img count:', (sanitizedHtml.match(/<img/g) || []).length);

    // Process images to ensure they have absolute URLs
    const processedResult = await processEmailImages(sanitizedHtml, {
      baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://app.zebamail.com',
      logDetails: true
    });

    console.log(`[Email Send] After processing - images: ${processedResult.imageCount}`);
    console.log('[Email Send] Final HTML length:', processedResult.html.length);
    console.log('[Email Send] Final HTML img count:', (processedResult.html.match(/<img/g) || []).length);
    
    // Transform S3 URLs to proxy URLs to avoid email client blocking
    const finalHtml = transformImageUrls(processedResult.html);
    console.log('[Email Send] After URL transformation - HTML length:', finalHtml.length);
    
    // Log a sample of the HTML to see if images are present
    const imgMatch = finalHtml.match(/<img[^>]*>/);
    if (imgMatch) {
      console.log('[Email Send] Sample img tag after transform:', imgMatch[0]);
    } else {
      console.log('[Email Send] WARNING: No img tags found in final HTML!');
    }

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
        html: finalHtml
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