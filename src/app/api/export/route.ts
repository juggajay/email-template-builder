import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { html, json, format, filename } = await request.json();

    if (!html || !json) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    let response;
    const headers: HeadersInit = {};

    switch (format) {
      case 'html':
        headers['Content-Type'] = 'text/html';
        headers['Content-Disposition'] = `attachment; filename="${filename || 'template.html'}"`;
        response = new Response(html, { headers });
        break;

      case 'json':
        headers['Content-Type'] = 'application/json';
        headers['Content-Disposition'] = `attachment; filename="${filename || 'template.json'}"`;
        response = new Response(JSON.stringify(json, null, 2), { headers });
        break;

      case 'mjml':
        // For MJML export, we need to convert the JSON structure to MJML format
        const mjml = convertToMJML(json);
        headers['Content-Type'] = 'text/plain';
        headers['Content-Disposition'] = `attachment; filename="${filename || 'template.mjml'}"`;
        response = new Response(mjml, { headers });
        break;

      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    return response;
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

function convertToMJML(json: any): string {
  // Basic MJML conversion - this would need to be expanded based on your template structure
  let mjml = `<mjml>
  <mj-head>
    <mj-title>${json.subject || 'Email Template'}</mj-title>
    <mj-preview>${json.preheader || ''}</mj-preview>
  </mj-head>
  <mj-body>`;

  // Convert blocks to MJML sections
  if (json.body && Array.isArray(json.body)) {
    json.body.forEach((block: any) => {
      mjml += convertBlockToMJML(block);
    });
  }

  mjml += `
  </mj-body>
</mjml>`;

  return mjml;
}

function convertBlockToMJML(block: any): string {
  switch (block.type) {
    case 'text':
      return `
    <mj-section>
      <mj-column>
        <mj-text>${block.content || ''}</mj-text>
      </mj-column>
    </mj-section>`;

    case 'image':
      return `
    <mj-section>
      <mj-column>
        <mj-image src="${block.src || ''}" alt="${block.alt || ''}" />
      </mj-column>
    </mj-section>`;

    case 'button':
      return `
    <mj-section>
      <mj-column>
        <mj-button href="${block.href || '#'}">${block.text || 'Click here'}</mj-button>
      </mj-column>
    </mj-section>`;

    default:
      return '';
  }
}