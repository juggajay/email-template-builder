import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { withRateLimit, rateLimiters } from '@/lib/security/rate-limit';
import { handleApiError, SafeError, SafeErrorType } from '@/lib/security/error-handling';
import { validateRequestBody, schemas, sanitizeHtml } from '@/lib/security/validation';
import { logSecurityEvent, SecurityEventType, extractRequestMetadata } from '@/lib/security/monitoring';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await withRateLimit(request, rateLimiters.api);
  if (rateLimitResult) return rateLimitResult;

  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get templates from database
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    return NextResponse.json({ templates });
  } catch (error) {
    return handleApiError(error, {
      action: 'get_templates',
      ...extractRequestMetadata(request)
    });
  }
}

// Define template creation schema
const createTemplateSchema = z.object({
  name: schemas.templateName,
  category: z.string().min(1).max(50),
  design_json: z.object({}).passthrough(),
  html_content: schemas.templateHtml
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await withRateLimit(request, rateLimiters.api);
  if (rateLimitResult) return rateLimitResult;

  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate request body
    const { data: validatedData, error: validationError } = await validateRequestBody(
      request,
      createTemplateSchema
    );

    if (validationError) {
      throw new SafeError(
        SafeErrorType.VALIDATION,
        validationError
      );
    }

    const { name, category, design_json, html_content } = validatedData!;
    
    // Sanitize HTML content
    const sanitizedHtml = sanitizeHtml(html_content);

    // Create new template
    const { data, error } = await supabase
      .from('user_templates')
      .insert({
        user_id: session.user.id,
        name,
        category,
        design_json,
        html_content: sanitizedHtml,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      );
    }

    // Log template creation
    await logSecurityEvent({
      type: SecurityEventType.DATA_EXPORT,
      userId: session.user.id,
      ...extractRequestMetadata(request),
      action: 'create_template',
      result: 'success',
      metadata: { template_id: data.id }
    });

    return NextResponse.json({ template: data }, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      action: 'create_template',
      ...extractRequestMetadata(request)
    });
  }
}