/**
 * Shopify Integration Utilities
 */

import { createHmac, randomBytes } from 'crypto';

/**
 * Generate OAuth state for CSRF protection
 */
export function generateOAuthState(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Build Shopify OAuth URL
 */
export function buildAuthUrl(
  shop: string,
  clientId: string,
  redirectUri: string,
  scopes: string[],
  state: string
): string {
  const scopeString = scopes.join(',');
  const params = new URLSearchParams({
    client_id: clientId,
    scope: scopeString,
    redirect_uri: redirectUri,
    state: state
  });

  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * Verify HMAC for OAuth callback
 */
export function verifyHmac(
  queryParams: Record<string, string>,
  clientSecret: string
): boolean {
  const { hmac, signature, ...params } = queryParams;
  
  // Create query string without hmac
  const message = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const hash = createHmac('sha256', clientSecret)
    .update(message)
    .digest('hex');

  return hash === hmac;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  shop: string,
  code: string,
  clientId: string,
  clientSecret: string
): Promise<{
  access_token: string;
  scope: string;
  expires_in?: number;
  associated_user_scope?: string;
  associated_user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    account_owner: boolean;
  };
}> {
  console.log('exchangeCodeForToken called with shop:', shop);
  
  if (!shop || shop === 'undefined') {
    throw new Error(`Invalid shop domain in exchangeCodeForToken: ${shop}`);
  }
  
  const tokenUrl = `https://${shop}/admin/oauth/access_token`;
  console.log('Token exchange URL:', tokenUrl);
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  const tokenData = await response.json();
  console.log('Token exchange successful');
  return tokenData;
}

/**
 * Format Shopify price
 */
export function formatPrice(price: string | number, currency: string = 'USD'): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(numPrice);
}

/**
 * Convert Shopify ID formats
 */
export function extractShopifyId(gid: string): string {
  // Extract numeric ID from Shopify GID format
  // e.g., "gid://shopify/Product/123456" -> "123456"
  const match = gid.match(/\/(\d+)$/);
  return match ? match[1] : gid;
}

export function toShopifyGid(id: string, resource: string): string {
  // Convert numeric ID to Shopify GID format
  // e.g., "123456" -> "gid://shopify/Product/123456"
  return `gid://shopify/${resource}/${id}`;
}

/**
 * Parse Shopify webhook headers
 */
export function parseWebhookHeaders(headers: Headers): {
  topic: string;
  hmac: string;
  shopDomain: string;
  apiVersion: string;
  webhookId: string;
} {
  return {
    topic: headers.get('x-shopify-topic') || '',
    hmac: headers.get('x-shopify-hmac-sha256') || '',
    shopDomain: headers.get('x-shopify-shop-domain') || '',
    apiVersion: headers.get('x-shopify-api-version') || '',
    webhookId: headers.get('x-shopify-webhook-id') || ''
  };
}

/**
 * Calculate sync intervals
 */
export function getSyncInterval(syncType: string): number {
  const intervals = {
    products: 6 * 60 * 60 * 1000, // 6 hours
    customers: 24 * 60 * 60 * 1000, // 24 hours
    orders: 60 * 60 * 1000, // 1 hour
    carts: 30 * 60 * 1000 // 30 minutes
  };

  return intervals[syncType as keyof typeof intervals] || 60 * 60 * 1000;
}

/**
 * Check if sync is needed
 */
export function shouldSync(lastSyncAt: Date | null, syncType: string): boolean {
  if (!lastSyncAt) return true;

  const interval = getSyncInterval(syncType);
  const timeSinceLastSync = Date.now() - lastSyncAt.getTime();

  return timeSinceLastSync >= interval;
}

/**
 * Build Shopify product URL
 */
export function buildProductUrl(shop: string, handle: string): string {
  return `https://${shop}/products/${handle}`;
}

/**
 * Build Shopify admin URL
 */
export function buildAdminUrl(shop: string, resource: string, id: string): string {
  const numericId = extractShopifyId(id);
  return `https://${shop}/admin/${resource}/${numericId}`;
}

/**
 * Validate Shopify shop domain
 */
export function isValidShopDomain(shop: string): boolean {
  const regex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
  return regex.test(shop);
}

/**
 * Format variant title
 */
export function formatVariantTitle(
  productTitle: string,
  variantTitle: string | null
): string {
  if (!variantTitle || variantTitle === 'Default Title') {
    return productTitle;
  }
  return `${productTitle} - ${variantTitle}`;
}

/**
 * Get inventory status
 */
export function getInventoryStatus(quantity?: number | null): {
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  label: string;
  color: string;
} {
  if (!quantity || quantity <= 0) {
    return {
      status: 'out_of_stock',
      label: 'Out of Stock',
      color: 'red'
    };
  } else if (quantity <= 5) {
    return {
      status: 'low_stock',
      label: `Low Stock (${quantity})`,
      color: 'yellow'
    };
  } else {
    return {
      status: 'in_stock',
      label: 'In Stock',
      color: 'green'
    };
  }
}

/**
 * Format order status
 */
export function formatOrderStatus(
  financialStatus: string,
  fulfillmentStatus: string | null
): {
  label: string;
  color: string;
  icon: string;
} {
  if (financialStatus === 'refunded' || financialStatus === 'voided') {
    return {
      label: 'Cancelled',
      color: 'red',
      icon: 'x-circle'
    };
  }

  if (fulfillmentStatus === 'fulfilled') {
    return {
      label: 'Delivered',
      color: 'green',
      icon: 'check-circle'
    };
  }

  if (financialStatus === 'paid' && fulfillmentStatus === null) {
    return {
      label: 'Processing',
      color: 'blue',
      icon: 'clock'
    };
  }

  if (financialStatus === 'pending') {
    return {
      label: 'Payment Pending',
      color: 'yellow',
      icon: 'alert-circle'
    };
  }

  return {
    label: 'Unknown',
    color: 'gray',
    icon: 'help-circle'
  };
}

/**
 * Calculate cart recovery potential
 */
export function calculateRecoveryPotential(
  cartValue: number,
  daysSinceAbandoned: number,
  customerOrderHistory?: number
): {
  score: number;
  priority: 'high' | 'medium' | 'low';
} {
  let score = 0;

  // Value score (0-40 points)
  if (cartValue >= 200) score += 40;
  else if (cartValue >= 100) score += 30;
  else if (cartValue >= 50) score += 20;
  else score += 10;

  // Recency score (0-30 points)
  if (daysSinceAbandoned <= 1) score += 30;
  else if (daysSinceAbandoned <= 3) score += 20;
  else if (daysSinceAbandoned <= 7) score += 10;

  // Customer history score (0-30 points)
  if (customerOrderHistory && customerOrderHistory > 0) {
    if (customerOrderHistory >= 5) score += 30;
    else if (customerOrderHistory >= 2) score += 20;
    else score += 10;
  }

  // Determine priority
  let priority: 'high' | 'medium' | 'low';
  if (score >= 70) priority = 'high';
  else if (score >= 40) priority = 'medium';
  else priority = 'low';

  return { score, priority };
}

/**
 * Batch array into chunks
 */
export function batchArray<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Delay for rate limiting
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Shopify API rate limiting
 */
export class RateLimiter {
  private requestCount = 0;
  private resetTime = Date.now() + 1000;
  private readonly maxRequests = 2; // Shopify allows 2 requests per second

  async throttle(): Promise<void> {
    const now = Date.now();
    
    if (now >= this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + 1000;
    }

    if (this.requestCount >= this.maxRequests) {
      const waitTime = this.resetTime - now;
      await delay(waitTime);
      this.requestCount = 0;
      this.resetTime = Date.now() + 1000;
    }

    this.requestCount++;
  }
}