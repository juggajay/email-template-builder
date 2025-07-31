/**
 * Email Image Processor
 * Ensures all images in email HTML are properly formatted with absolute URLs
 * Now with base64 conversion for local images
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

export interface ImageProcessingOptions {
  baseUrl?: string;
  convertLocalToBase64?: boolean;
  logDetails?: boolean;
  publicDir?: string;
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
 * Fetch image from URL and convert to base64
 */
async function fetchImageAsBase64(imageUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const protocol = imageUrl.startsWith('https') ? https : http;
      
      protocol.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          console.warn(`[ImageProcessor] Failed to fetch image: ${imageUrl} (${response.statusCode})`);
          resolve(null);
          return;
        }
        
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const contentType = response.headers['content-type'] || 'image/png';
          const base64 = buffer.toString('base64');
          resolve(`data:${contentType};base64,${base64}`);
        });
      }).on('error', (err) => {
        console.error(`[ImageProcessor] Error fetching image: ${imageUrl}`, err);
        resolve(null);
      });
    } catch (error) {
      console.error(`[ImageProcessor] Error in fetchImageAsBase64: ${imageUrl}`, error);
      resolve(null);
    }
  });
}

/**
 * Convert local file to base64
 */
async function fileToBase64(filePath: string): Promise<string | null> {
  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp'
    };
    const mimeType = mimeTypes[ext] || 'image/png';
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error(`[ImageProcessor] Error reading file: ${filePath}`, error);
    return null;
  }
}

/**
 * Process HTML to ensure all images work in emails (with base64 conversion for local images)
 */
export async function processEmailImages(
  html: string,
  options: ImageProcessingOptions = {}
): Promise<ImageProcessingResult> {
  const {
    baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.zebamail.com',
    convertLocalToBase64 = true,
    logDetails = true,
    publicDir = process.cwd() + '/public'
  } = options;

  const processedImages: ImageProcessingResult['processedImages'] = [];
  let processedHtml = html;

  // Find all img tags with various attribute formats
  const imgRegex = /<img[^>]*>/gi;
  const imgTags = html.match(imgRegex) || [];

  if (logDetails && imgTags.length > 0) {
    console.log(`[ImageProcessor] Found ${imgTags.length} images to process`);
  }

  for (let index = 0; index < imgTags.length; index++) {
    const imgTag = imgTags[index];
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
    let converted = false;

    // Skip data URLs (base64 images)
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
      
      // Check if it's a localhost URL and convert to base64
      if (convertLocalToBase64 && (originalSrc.includes('localhost') || originalSrc.includes('127.0.0.1'))) {
        if (logDetails) {
          console.log(`[ImageProcessor] Image ${index + 1}: Converting localhost URL to base64`);
        }
        
        const base64 = await fetchImageAsBase64(originalSrc);
        if (base64) {
          processedSrc = base64;
          converted = true;
          imageType = 'data';
        } else {
          console.warn(`[ImageProcessor] Failed to convert localhost image to base64: ${originalSrc}`);
        }
      } else if (logDetails) {
        console.log(`[ImageProcessor] Image ${index + 1}: Already absolute`);
      }
    }
    // Handle relative URLs
    else {
      imageType = 'relative';
      
      if (convertLocalToBase64) {
        // Try to load from file system first
        const filePath = path.join(publicDir, originalSrc);
        
        if (logDetails) {
          console.log(`[ImageProcessor] Image ${index + 1}: Attempting to convert local file to base64: ${filePath}`);
        }
        
        const base64 = await fileToBase64(filePath);
        if (base64) {
          processedSrc = base64;
          converted = true;
          imageType = 'data';
          if (logDetails) {
            console.log(`[ImageProcessor] Image ${index + 1}: Successfully converted to base64`);
          }
        } else {
          // If file doesn't exist locally, try fetching from URL
          const fullUrl = originalSrc.startsWith('/') ? `${baseUrl}${originalSrc}` : `${baseUrl}/${originalSrc}`;
          
          if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
            const fetchedBase64 = await fetchImageAsBase64(fullUrl);
            
            if (fetchedBase64) {
              processedSrc = fetchedBase64;
              converted = true;
              imageType = 'data';
              if (logDetails) {
                console.log(`[ImageProcessor] Image ${index + 1}: Fetched and converted to base64 from localhost URL`);
              }
            } else {
              console.warn(`[ImageProcessor] Failed to convert image to base64: ${fullUrl}`);
              processedSrc = fullUrl;
            }
          } else {
            // For non-localhost URLs, just use absolute URL
            processedSrc = fullUrl;
            if (logDetails) {
              console.log(`[ImageProcessor] Image ${index + 1}: Using absolute URL`);
            }
          }
        }
      } else {
        // Just convert to absolute URL
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
      processed: processedSrc.length > 100 ? processedSrc.substring(0, 100) + '...' : processedSrc,
      type: imageType,
      converted
    });
  }

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
    console.log(`  - Converted to base64: ${processedImages.filter(img => img.converted).length}`);
    console.log(`  - Already base64: ${processedImages.filter(img => img.type === 'data' && !img.converted).length}`);
    console.log(`  - External absolute URLs: ${processedImages.filter(img => img.type === 'absolute' && !img.converted).length}`);
    console.log(`  - Failed conversions: ${processedImages.filter(img => (img.type === 'relative' || (img.type === 'absolute' && (img.original.includes('localhost') || img.original.includes('127.0.0.1')))) && !img.converted).length}`);
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