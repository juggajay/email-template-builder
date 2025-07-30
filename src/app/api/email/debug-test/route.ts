import { NextRequest, NextResponse } from 'next/server';
import { processEmailImages } from '@/lib/email/image-processor-fixed';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html } = body;

    console.log('[Debug Test] Received HTML length:', html?.length || 0);
    console.log('[Debug Test] HTML contains <img:', html?.includes('<img') || false);
    
    // Process the HTML
    const processed = await processEmailImages(html || '', {
      baseUrl: 'http://localhost:3000',
      logDetails: true
    });
    
    console.log('[Debug Test] Processed result:', {
      imageCount: processed.imageCount,
      htmlLength: processed.html.length,
      processedImages: processed.processedImages
    });
    
    return NextResponse.json({
      success: true,
      original: {
        length: html?.length || 0,
        hasImages: html?.includes('<img') || false
      },
      processed: {
        length: processed.html.length,
        imageCount: processed.imageCount,
        images: processed.processedImages
      },
      processedHtml: processed.html
    });
    
  } catch (error) {
    console.error('[Debug Test] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}