import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { html, device = 'desktop' } = await request.json();

    // Add viewport meta tags based on device
    const viewportMeta = device === 'mobile' 
      ? '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
      : '<meta name="viewport" content="width=600">';

    // Wrap HTML with proper email structure
    const previewHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        ${viewportMeta}
        <style>
          body { margin: 0; padding: 0; }
          ${device === 'mobile' ? `
            @media only screen and (max-width: 600px) {
              table { width: 100% !important; }
              td { display: block !important; width: 100% !important; }
            }
          ` : ''}
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

    return NextResponse.json({ 
      success: true, 
      html: previewHtml,
      device 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Preview generation failed' },
      { status: 500 }
    );
  }
}