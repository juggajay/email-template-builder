/**
 * Fixed Email Image Processor
 * Preserves external images (including Unlayer uploads) and only processes local images
 */

export interface ImageProcessingOptions {
  baseUrl?: string;
  logDetails?: boolean;
}

export interface ImageProcessingResult {
  html: string;
  imageCount: number;
  processedImages: {
    original: string;
    processed: string;
    type: 'relative' | 'absolute' | 'data' | 'protocol-relative';
    action: 'preserved' | 'converted' | 'skipped';
  }[];
}

/**
 * Process HTML to ensure all images work in emails
 * - Preserves external images (including Unlayer CDN uploads)
 * - Converts relative URLs to absolute using baseUrl
 * - Preserves data URLs
 * - Does NOT replace with placeholders
 */
export async function processEmailImages(
  html: string,
  options: ImageProcessingOptions = {}
): Promise<ImageProcessingResult> {
  const {
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.zebamail.com',
    logDetails = true
  } = options;

  const processedImages: ImageProcessingResult['processedImages'] = [];
  let processedHtml = html;

  // Find all img tags
  const imgRegex = /<img[^>]*>/gi;
  const imgTags = html.match(imgRegex) || [];

  if (logDetails && imgTags.length > 0) {
    console.log(`[ImageProcessor] Found ${imgTags.length} images to process`);
  }

  for (let index = 0; index < imgTags.length; index++) {
    const imgTag = imgTags[index];
    
    // Extract src attribute
    const srcMatch = imgTag.match(/src\s*=\s*["']([^"']+)["']/i) ||
                     imgTag.match(/src\s*=\s*([^\s>]+)/i);
    
    if (!srcMatch || !srcMatch[1]) {
      continue;
    }

    const originalSrc = srcMatch[1];
    let processedSrc = originalSrc;
    let imageType: ImageProcessingResult['processedImages'][0]['type'] = 'absolute';
    let action: ImageProcessingResult['processedImages'][0]['action'] = 'preserved';

    // Skip data URLs - they're already embedded
    if (originalSrc.startsWith('data:')) {
      imageType = 'data';
      action = 'preserved';
      if (logDetails) {
        console.log(`[ImageProcessor] Image ${index + 1}: Data URL preserved`);
      }
    }
    // Handle protocol-relative URLs
    else if (originalSrc.startsWith('//')) {
      imageType = 'protocol-relative';
      processedSrc = `https:${originalSrc}`;
      action = 'converted';
      if (logDetails) {
        console.log(`[ImageProcessor] Image ${index + 1}: Protocol-relative URL converted to HTTPS`);
      }
    }
    // Handle absolute URLs - PRESERVE THESE
    else if (originalSrc.match(/^https?:\/\//i)) {
      imageType = 'absolute';
      action = 'preserved';
      
      // Log what we're preserving
      if (logDetails) {
        const url = new URL(originalSrc);
        console.log(`[ImageProcessor] Image ${index + 1}: Preserving external image from ${url.hostname}`);
        
        // Common CDNs used by email builders
        if (url.hostname.includes('unlayer.com')) {
          console.log(`  ✓ Unlayer CDN image preserved`);
        } else if (url.hostname.includes('cloudinary.com')) {
          console.log(`  ✓ Cloudinary image preserved`);
        } else if (url.hostname.includes('unsplash.com')) {
          console.log(`  ✓ Unsplash image preserved`);
        }
      }
      
      // DO NOT modify external URLs - they should work in emails
      processedSrc = originalSrc;
    }
    // Handle relative URLs - convert to absolute
    else {
      imageType = 'relative';
      action = 'converted';
      
      // Convert relative to absolute URL
      processedSrc = originalSrc.startsWith('/') 
        ? `${baseUrl}${originalSrc}` 
        : `${baseUrl}/${originalSrc}`;
      
      if (logDetails) {
        console.log(`[ImageProcessor] Image ${index + 1}: Converted relative URL to absolute`);
        console.log(`  From: ${originalSrc}`);
        console.log(`  To: ${processedSrc}`);
      }
    }

    // Replace the src in the img tag only if it changed
    if (processedSrc !== originalSrc) {
      let newImgTag = imgTag;
      
      // Try to replace quoted src first
      if (imgTag.match(/src\s*=\s*["'][^"']+["']/i)) {
        newImgTag = imgTag.replace(
          /src\s*=\s*["']([^"']+)["']/i,
          `src="${processedSrc}"`
        );
      }
      // Otherwise try unquoted src
      else if (imgTag.match(/src\s*=\s*[^\s>]+/i)) {
        newImgTag = imgTag.replace(
          /src\s*=\s*([^\s>]+)/i,
          `src="${processedSrc}"`
        );
      }
      
      processedHtml = processedHtml.replace(imgTag, newImgTag);
    }

    processedImages.push({
      original: originalSrc,
      processed: processedSrc,
      type: imageType,
      action
    });
  }

  // Also process CSS background images (only relative ones)
  processedHtml = processedHtml.replace(
    /background(-image)?:\s*url\(["']?(?!https?:\/\/)(?!\/\/)(?!data:)([^"')]+)["']?\)/gi,
    (match, p1, url) => {
      const absoluteUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
      if (logDetails) {
        console.log(`[ImageProcessor] CSS background: Converted relative URL to absolute`);
      }
      return `background${p1 || ''}:url("${absoluteUrl}")`;
    }
  );

  if (logDetails) {
    console.log(`[ImageProcessor] Processing complete:`);
    console.log(`  - Total images: ${imgTags.length}`);
    console.log(`  - Preserved: ${processedImages.filter(img => img.action === 'preserved').length}`);
    console.log(`  - Converted: ${processedImages.filter(img => img.action === 'converted').length}`);
    
    // List all preserved external images
    const preservedExternal = processedImages.filter(
      img => img.type === 'absolute' && img.action === 'preserved'
    );
    if (preservedExternal.length > 0) {
      console.log(`  - External images preserved:`);
      preservedExternal.forEach((img, idx) => {
        console.log(`    ${idx + 1}. ${img.original}`);
      });
    }
  }

  return {
    html: processedHtml,
    imageCount: imgTags.length,
    processedImages
  };
}