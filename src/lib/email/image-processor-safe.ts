/**
 * Safe Email Image Processor
 * A simpler, safer version that's less likely to corrupt HTML
 */

export interface SafeImageProcessingResult {
  html: string;
  imageCount: number;
  errors: string[];
}

/**
 * Safely process HTML to ensure images have absolute URLs
 * This version prioritizes preserving the HTML integrity over perfect processing
 */
export function safeProcessEmailImages(
  html: string,
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : 'https://app.zebamail.com'
): SafeImageProcessingResult {
  const errors: string[] = [];
  let processedHtml = html;
  let imageCount = 0;

  try {
    // Count images
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    imageCount = imgMatches.length;

    // Process each image tag carefully
    imgMatches.forEach((imgTag) => {
      try {
        // Extract src attribute
        const srcMatch = imgTag.match(/src\s*=\s*["']([^"']+)["']/i);
        if (!srcMatch || !srcMatch[1]) return;

        const originalSrc = srcMatch[1];
        let newSrc = originalSrc;

        // Only process if it's not already absolute or data URL
        if (!originalSrc.match(/^https?:\/\//i) && !originalSrc.startsWith('data:')) {
          if (originalSrc.startsWith('//')) {
            // Protocol-relative URL
            newSrc = `https:${originalSrc}`;
          } else if (originalSrc.startsWith('/')) {
            // Root-relative URL
            newSrc = `${baseUrl}${originalSrc}`;
          } else {
            // Relative URL
            newSrc = `${baseUrl}/${originalSrc}`;
          }

          // Replace only this specific src in this specific img tag
          const newImgTag = imgTag.replace(
            /src\s*=\s*["'][^"']+["']/i,
            `src="${newSrc}"`
          );
          
          processedHtml = processedHtml.replace(imgTag, newImgTag);
        }
      } catch (err) {
        errors.push(`Failed to process image: ${err}`);
      }
    });

  } catch (err) {
    errors.push(`Image processing error: ${err}`);
    // Return original HTML if processing fails
    return { html, imageCount: 0, errors };
  }

  return { html: processedHtml, imageCount, errors };
}

/**
 * Add image dimensions from style attributes
 */
export function safeAddImageDimensions(html: string): string {
  try {
    return html.replace(
      /<img([^>]+)>/gi,
      (match, attributes) => {
        // Skip if already has width or height
        if (attributes.match(/\b(?:width|height)\s*=/i)) {
          return match;
        }
        
        // Look for width/height in style
        const styleMatch = attributes.match(/style\s*=\s*["']([^"']+)["']/i);
        if (styleMatch) {
          const style = styleMatch[1];
          const widthMatch = style.match(/width:\s*(\d+)px/i);
          const heightMatch = style.match(/height:\s*(\d+)px/i);
          
          if (widthMatch || heightMatch) {
            let additions = '';
            if (widthMatch) additions += ` width="${widthMatch[1]}"`;
            if (heightMatch) additions += ` height="${heightMatch[1]}"`;
            return `<img${attributes}${additions}>`;
          }
        }
        
        return match;
      }
    );
  } catch (err) {
    console.error('Failed to add image dimensions:', err);
    return html; // Return original if processing fails
  }
}