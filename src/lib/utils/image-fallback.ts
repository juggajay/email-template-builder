/**
 * Centralized image fallback utility
 * Handles placeholder images and provides fallbacks for broken/external images
 */

// Default fallback image path
const DEFAULT_FALLBACK = '/images/template-placeholder.svg';

// Known placeholder domains to replace
const PLACEHOLDER_DOMAINS = [
  'via.placeholder.com',
  'placeholder.com',
  'placehold.it',
  'placekitten.com',
  'placeimg.com'
];

/**
 * Get a safe image URL with fallback
 * @param url - The original image URL
 * @param fallback - Optional custom fallback image
 * @returns Safe image URL
 */
export function getImageUrl(url: string | undefined | null, fallback?: string): string {
  // If no URL provided, return fallback
  if (!url) {
    return fallback || DEFAULT_FALLBACK;
  }

  // Check if URL contains placeholder domains
  const isPlaceholder = PLACEHOLDER_DOMAINS.some(domain => url.includes(domain));
  if (isPlaceholder) {
    return fallback || DEFAULT_FALLBACK;
  }

  // Return the original URL if it's valid
  return url;
}

/**
 * Get a base64 placeholder image
 * @param width - Image width
 * @param height - Image height
 * @param text - Optional text to display
 * @returns Base64 encoded SVG
 */
export function getBase64Placeholder(width = 300, height = 200, text = 'Image'): string {
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#F5F5F5"/>
      <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" stroke="#E0E0E0" stroke-dasharray="8 4"/>
      <text x="${width / 2}" y="${height / 2}" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#757575" text-anchor="middle" alignment-baseline="middle">
        ${text}
      </text>
    </svg>
  `;
  
  const encoded = Buffer.from(svg.trim()).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

/**
 * Handle image loading errors
 * @param event - The error event
 * @param fallback - Optional fallback image
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>, fallback?: string) {
  const img = event.currentTarget;
  img.src = fallback || DEFAULT_FALLBACK;
  img.onerror = null; // Prevent infinite loop
}

/**
 * Preload images to check if they're accessible
 * @param urls - Array of image URLs to preload
 * @returns Promise that resolves when all images are checked
 */
export async function preloadImages(urls: string[]): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  
  await Promise.all(
    urls.map(url => 
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          results.set(url, true);
          resolve();
        };
        img.onerror = () => {
          results.set(url, false);
          resolve();
        };
        img.src = url;
      })
    )
  );
  
  return results;
}