/**
 * Simplified Email Image Processor
 * Converts localhost URLs to external placeholder images for testing
 */

export interface ImageProcessingOptions {
  baseUrl?: string;
  convertLocalToBase64?: boolean;
  logDetails?: boolean;
}

export interface ImageProcessingResult {
  html: string;
  imageCount: number;
  processedImages: {
    original: string;
    processed: string;
    type: 'relative' | 'absolute' | 'data' | 'protocol-relative';
    converted?: boolean;
  }[];
}

/**
 * Process HTML to ensure all images work in emails
 * For now, replace localhost images with placeholder images
 */
export async function processEmailImages(
  html: string,
  options: ImageProcessingOptions = {}
): Promise<ImageProcessingResult> {
  const {
    baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    convertLocalToBase64 = true,
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
    let converted = false;

    // Skip data URLs
    if (originalSrc.startsWith('data:')) {
      imageType = 'data';
      if (logDetails) {
        console.log(`[ImageProcessor] Image ${index + 1}: Already base64`);
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
      
      // Check if it's a localhost URL and replace with placeholder
      if (convertLocalToBase64 && (originalSrc.includes('localhost') || originalSrc.includes('127.0.0.1'))) {
        if (logDetails) {
          console.log(`[ImageProcessor] Image ${index + 1}: Replacing localhost URL with placeholder`);
        }
        
        // Use a placeholder image service
        processedSrc = 'https://via.placeholder.com/600x400/007bff/ffffff?text=Email+Image';
        converted = true;
      } else if (logDetails) {
        console.log(`[ImageProcessor] Image ${index + 1}: Already absolute`);
      }
    }
    // Handle relative URLs
    else {
      imageType = 'relative';
      
      if (convertLocalToBase64 && (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1'))) {
        // Replace with placeholder for localhost
        processedSrc = 'https://via.placeholder.com/600x400/28a745/ffffff?text=Local+Image';
        converted = true;
        if (logDetails) {
          console.log(`[ImageProcessor] Image ${index + 1}: Replacing relative URL with placeholder`);
        }
      } else {
        // For non-localhost, convert to absolute URL
        processedSrc = originalSrc.startsWith('/') ? `${baseUrl}${originalSrc}` : `${baseUrl}/${originalSrc}`;
        if (logDetails) {
          console.log(`[ImageProcessor] Image ${index + 1}: Converted to absolute URL`);
        }
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
      type: imageType,
      converted
    });
  }

  // Also process CSS background images
  processedHtml = processedHtml.replace(
    /background(-image)?:\s*url\(["']?(?!https?:\/\/)(?!data:)([^"')]+)["']?\)/gi,
    (match, p1, url) => {
      if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
        const placeholderUrl = 'https://via.placeholder.com/800x200/6c757d/ffffff?text=Background';
        if (logDetails) {
          console.log(`[ImageProcessor] CSS background replaced with placeholder`);
        }
        return `background${p1 || ''}:url("${placeholderUrl}")`;
      } else {
        const absoluteUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
        return `background${p1 || ''}:url("${absoluteUrl}")`;
      }
    }
  );

  if (logDetails) {
    console.log(`[ImageProcessor] Processing complete:`);
    console.log(`  - Total images: ${imgTags.length}`);
    console.log(`  - Replaced with placeholders: ${processedImages.filter(img => img.converted).length}`);
    console.log(`  - Already external: ${processedImages.filter(img => img.type === 'absolute' && !img.converted).length}`);
  }

  return {
    html: processedHtml,
    imageCount: imgTags.length,
    processedImages
  };
}