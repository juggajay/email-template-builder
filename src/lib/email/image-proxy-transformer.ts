/**
 * Image Proxy Transformer for Unlayer Free Mode
 * Transforms S3 URLs to proxy URLs that email clients won't block
 */

/**
 * Transform S3 URLs to proxy URLs using wsrv.nl (trusted by email clients)
 */
export function transformBlockedImageUrls(html: string): string {
  if (!html) return html;
  
  console.log('[ImageProxy] Checking for S3/blocked URLs');
  
  // Pattern to match any amazonaws.com URLs (including Unlayer's S3)
  const s3Pattern = /https?:\/\/[^"'\s]*\.amazonaws\.com\/[^"'\s)]*/g;
  const matches = html.match(s3Pattern) || [];
  
  if (matches.length > 0) {
    console.log(`[ImageProxy] Found ${matches.length} S3 URLs to transform`);
  }
  
  // Replace S3 URLs with proxy URLs
  let transformedHtml = html.replace(s3Pattern, (match) => {
    // Use wsrv.nl - a reliable image proxy trusted by email clients
    const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(match)}&w=800&output=webp&q=90`;
    console.log(`[ImageProxy] Transforming S3 URL to proxy`);
    return proxyUrl;
  });
  
  return transformedHtml;
}