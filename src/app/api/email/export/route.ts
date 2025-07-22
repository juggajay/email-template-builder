import { NextRequest, NextResponse } from 'next/server';
import { EmailExportService } from '@/lib/email/export';
import { authService } from '@/lib/supabase/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await authService.getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { html, format, platform, options } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    let exportedContent: string | Blob;

    switch (format) {
      case 'html':
        exportedContent = await EmailExportService.exportAsHTML(html, {
          inlineCSS: true,
          minify: options?.minify || false,
          preserveMediaQueries: true,
          preserveFontFaces: true,
          strategy: options?.strategy,
        });
        break;

      case 'platform':
        if (!platform) {
          return NextResponse.json(
            { error: 'Platform is required for platform export' },
            { status: 400 }
          );
        }
        exportedContent = await EmailExportService.exportForPlatform(
          html,
          platform,
          {
            inlineCSS: true,
            ...options,
          }
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid export format' },
          { status: 400 }
        );
    }

    // Record the export
    await authService.recordExport(user.id, options?.templateId || 'unknown', format);

    return NextResponse.json({
      success: true,
      content: exportedContent,
      message: 'Email exported successfully with inline CSS',
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export email' },
      { status: 500 }
    );
  }
}