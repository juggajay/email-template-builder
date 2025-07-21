import crypto from 'crypto';

/**
 * Validate Shopify webhook HMAC
 * @param rawBody - The raw request body as string
 * @param hmacHeader - The X-Shopify-Hmac-Sha256 header value
 * @returns boolean indicating if HMAC is valid
 */
export function validateShopifyWebhookHMAC(
  rawBody: string,
  hmacHeader: string | null
): boolean {
  if (!hmacHeader) {
    return false;
  }

  const webhookSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!webhookSecret) {
    console.error('SHOPIFY_CLIENT_SECRET not configured');
    return false;
  }

  // Calculate HMAC
  const hash = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody, 'utf8')
    .digest('base64');

  // Compare with header
  return hash === hmacHeader;
}

/**
 * Standard response for GDPR webhooks
 */
export function createGDPRResponse(success: boolean = true) {
  if (success) {
    return new Response('OK', { status: 200 });
  }
  return new Response('Processing', { status: 200 });
}