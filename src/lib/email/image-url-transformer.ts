/**
 * Image URL Transformer
 * Transforms Unlayer S3 URLs to proxy URLs that email clients won't block
 */

/**
 * Transform S3 URLs to proxy URLs that won't be blocked by email clients
 * This is a simpler alternative to custom upload that doesn't require storage setup
 */
export function transformImageUrls(html: string): string {
  if (!html) return html;
  
  console.log('[ImageTransformer] Processing HTML for S3 URLs');
  
  // Pattern to match Unlayer S3 URLs
  const s3Pattern = /https:\/\/unroll-images-production\.s3\.amazonaws\.com\/[^"'\s)]+/g;
  const s3Matches = html.match(s3Pattern) || [];
  
  if (s3Matches.length > 0) {
    console.log(`[ImageTransformer] Found ${s3Matches.length} S3 URLs to transform`);
  }
  
  // Replace S3 URLs with a proxy service that email clients trust
  // Option 1: Use images.weserv.nl (free image proxy service)
  let transformedHtml = html.replace(s3Pattern, (match) => {
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(match)}&w=800&h=800&fit=inside&we`;
    console.log(`[ImageTransformer] Transformed: ${match.substring(0, 50)}... → ${proxyUrl.substring(0, 50)}...`);
    return proxyUrl;
  });
  
  // Also handle any other amazonaws.com URLs
  const amazonPattern = /https:\/\/[^"'\s]*\.amazonaws\.com\/[^"'\s)]+/g;
  transformedHtml = transformedHtml.replace(amazonPattern, (match) => {
    if (!match.includes('unroll-images')) {
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(match)}&w=800&h=800&fit=inside&we`;
      console.log(`[ImageTransformer] Transformed AWS URL: ${match.substring(0, 50)}...`);
      return proxyUrl;
    }
    return match;
  });
  
  // Count images after transformation
  const imgCount = (transformedHtml.match(/<img/g) || []).length;
  console.log(`[ImageTransformer] Total images in HTML: ${imgCount}`);
  
  return transformedHtml;
}

/**
 * Alternative: Use a different proxy service
 * wsrv.nl is reliable and trusted by email clients
 */
export function transformWithAlternativeProxy(html: string): string {
  if (!html) return html;
  
  // Replace S3 URLs with proxy URLs
  return html.replace(
    /https:\/\/([^"'\s]*\.amazonaws\.com\/[^"'\s)]+)/g,
    (match, path) => {
      // Use wsrv.nl which is trusted by email clients
      return `https://wsrv.nl/?url=${encodeURIComponent(match)}&w=800&output=jpg&q=90`;
    }
  );
}

/**
 * Check if HTML contains S3 URLs that might be blocked
 */
export function containsBlockedUrls(html: string): boolean {
  const s3Pattern = /https:\/\/[^"'\s]*\.amazonaws\.com\//;
  return s3Pattern.test(html);
}

/**
 * Get all image URLs from HTML
 */
export function extractImageUrls(html: string): string[] {
  const imgPattern = /<img[^>]*src=["']([^"']+)["'][^>]*>/g;
  const urls: string[] = [];
  let match;
  
  while ((match = imgPattern.exec(html)) !== null) {
    urls.push(match[1]);
  }
  
  return urls;
}