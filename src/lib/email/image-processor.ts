/**
 * Email Image Processor
 * Ensures all images in email HTML are properly formatted with absolute URLs
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
  }[];
}

/**
 * Process HTML to ensure all images have absolute URLs for email compatibility
 */
export function processEmailImages(
  html: string,
  options: ImageProcessingOptions = {}
): ImageProcessingResult {
  const {
    baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.zebamail.com',
    logDetails = true
  } = options;

  const processedImages: ImageProcessingResult['processedImages'] = [];
  let processedHtml = html;

  // Find all img tags with various attribute formats
  const imgRegex = /<img[^>]*>/gi;
  const imgTags = html.match(imgRegex) || [];

  if (logDetails && imgTags.length > 0) {
    console.log(`[ImageProcessor] Found ${imgTags.length} images to process`);
  }

  imgTags.forEach((imgTag, index) => {
    // Extract src attribute - handle various quote styles and formats
    const srcMatch = imgTag.match(/src\s*=\s*["']([^"']+)["']/i) ||
                     imgTag.match(/src\s*=\s*([^\s>]+)/i);
    
    if (!srcMatch || !srcMatch[1]) {
      if (logDetails) {
        console.warn(`[ImageProcessor] Image ${index + 1}: No src attribute found`);
      }
      return;
    }

    const originalSrc = srcMatch[1];
    let processedSrc = originalSrc;
    let imageType: ImageProcessingResult['processedImages'][0]['type'] = 'absolute';

    // Skip data URLs (base64 images)
    if (originalSrc.startsWith('data:')) {
      imageType = 'data';
      if (logDetails) {
        console.log(`[ImageProcessor] Image ${index + 1}: Data URL (${originalSrc.length} chars)`);
      }
    }
    // Handle protocol-relative URLs
    else if (originalSrc.startsWith('//')) {
      imageType = 'protocol-relative';
      processedSrc = `https:${originalSrc}`;
      if (logDetails) {
        console.log(`[ImageProcessor] Image ${index + 1}: Protocol-relative URL converted`);
      }
    }
    // Handle absolute URLs
    else if (originalSrc.match(/^https?:\/\//i)) {
      imageType = 'absolute';
      if (logDetails) {
        console.log(`[ImageProcessor] Image ${index + 1}: Already absolute`);
      }
    }
    // Handle root-relative URLs (/uploads/...)
    else if (originalSrc.startsWith('/')) {
      imageType = 'relative';
      processedSrc = `${baseUrl}${originalSrc}`;
      if (logDetails) {
        console.log(`[ImageProcessor] Image ${index + 1}: Root-relative URL converted`);
      }
    }
    // Handle relative URLs (uploads/..., ./uploads/..., ../uploads/...)
    else {
      imageType = 'relative';
      // Remove ./ or ../ prefixes
      const cleanPath = originalSrc.replace(/^(\.\.\/)+/, '').replace(/^\.?\//, '');
      processedSrc = `${baseUrl}/${cleanPath}`;
      if (logDetails) {
        console.log(`[ImageProcessor] Image ${index + 1}: Relative URL converted`);
      }
    }

    // Replace the src in the img tag
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
      type: imageType
    });
  });

  // Also process CSS background images
  processedHtml = processedHtml.replace(
    /background(-image)?:\s*url\(["']?(?!https?:\/\/)(?!data:)([^"')]+)["']?\)/gi,
    (match, p1, url) => {
      const absoluteUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
      if (logDetails) {
        console.log(`[ImageProcessor] CSS background image converted: ${url} -> ${absoluteUrl}`);
      }
      return `background${p1 || ''}:url("${absoluteUrl}")`;
    }
  );

  // Process srcset attributes for responsive images
  processedHtml = processedHtml.replace(
    /srcset\s*=\s*["']([^"']+)["']/gi,
    (match, srcset) => {
      const processedSrcset = srcset.split(',').map((src: string) => {
        const [url, descriptor] = src.trim().split(/\s+/);
        if (!url.match(/^https?:\/\//i) && !url.startsWith('data:')) {
          const absoluteUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
          return `${absoluteUrl} ${descriptor || ''}`;
        }
        return src;
      }).join(', ');
      
      if (logDetails && processedSrcset !== srcset) {
        console.log(`[ImageProcessor] Srcset processed`);
      }
      
      return `srcset="${processedSrcset}"`;
    }
  );

  if (logDetails) {
    console.log(`[ImageProcessor] Processing complete:`);
    console.log(`  - Total images: ${imgTags.length}`);
    console.log(`  - Relative URLs converted: ${processedImages.filter(img => img.type === 'relative' && img.original !== img.processed).length}`);
    console.log(`  - Protocol-relative URLs converted: ${processedImages.filter(img => img.type === 'protocol-relative').length}`);
    console.log(`  - Already absolute: ${processedImages.filter(img => img.type === 'absolute').length}`);
    console.log(`  - Data URLs: ${processedImages.filter(img => img.type === 'data').length}`);
  }

  return {
    html: processedHtml,
    imageCount: imgTags.length,
    processedImages
  };
}

/**
 * Validate that all images in HTML have absolute URLs
 */
export function validateEmailImages(html: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for relative image URLs
  const relativeImgRegex = /<img[^>]+src\s*=\s*["'](?!https?:\/\/)(?!data:)(?!\/\/)([^"']+)["'][^>]*>/gi;
  const relativeImages = html.match(relativeImgRegex) || [];
  
  if (relativeImages.length > 0) {
    issues.push(`Found ${relativeImages.length} images with relative URLs`);
  }

  // Check for images without width/height attributes (recommended for email)
  const imgWithoutDimensions = html.match(/<img(?![^>]*(?:width|height))[^>]*>/gi) || [];
  
  if (imgWithoutDimensions.length > 0) {
    issues.push(`Found ${imgWithoutDimensions.length} images without width/height attributes`);
  }

  // Check for very large base64 images (>100KB)
  const largeDataUrls = html.match(/src\s*=\s*["']data:image\/[^;]+;base64,([^"']{100000,})["']/gi) || [];
  
  if (largeDataUrls.length > 0) {
    issues.push(`Found ${largeDataUrls.length} base64 images larger than 100KB`);
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Add width and height attributes to images for better email client support
 */
export function addImageDimensions(html: string): string {
  return html.replace(
    /<img([^>]+)>/gi,
    (match, attributes) => {
      // Skip if already has width or height
      if (attributes.match(/(?:width|height)\s*=/i)) {
        return match;
      }
      
      // Extract style attribute
      const styleMatch = attributes.match(/style\s*=\s*["']([^"']+)["']/i);
      if (styleMatch) {
        const style = styleMatch[1];
        const widthMatch = style.match(/width:\s*(\d+)px/i);
        const heightMatch = style.match(/height:\s*(\d+)px/i);
        
        if (widthMatch || heightMatch) {
          let newAttributes = attributes;
          if (widthMatch) {
            newAttributes += ` width="${widthMatch[1]}"`;
          }
          if (heightMatch) {
            newAttributes += ` height="${heightMatch[1]}"`;
          }
          return `<img${newAttributes}>`;
        }
      }
      
      return match;
    }
  );
}