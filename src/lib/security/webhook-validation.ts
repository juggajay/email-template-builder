/**
 * Enhanced Webhook Security
 * Provides signature verification, timestamp validation, and replay attack prevention
 */

import crypto from 'crypto';

// Store processed webhook IDs to prevent replay attacks
const processedWebhooks = new Map<string, number>();

// Clean up old webhook IDs every hour
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  processedWebhooks.forEach((timestamp, id) => {
    if (timestamp < oneHourAgo) {
      processedWebhooks.delete(id);
    }
  });
}, 60 * 60 * 1000);

interface WebhookValidationOptions {
  secret: string;
  timestampHeader?: string;
  signatureHeader?: string;
  idHeader?: string;
  maxAgeSeconds?: number;
  algorithm?: string;
}

/**
 * Validate webhook signature and prevent replay attacks
 */
export async function validateWebhook(
  request: Request,
  options: WebhookValidationOptions
): Promise<{ valid: boolean; error?: string; body?: string }> {
  const {
    secret,
    timestampHeader = 'x-webhook-timestamp',
    signatureHeader = 'x-webhook-signature',
    idHeader = 'x-webhook-id',
    maxAgeSeconds = 300, // 5 minutes
    algorithm = 'sha256'
  } = options;

  try {
    // Get headers
    const timestamp = request.headers.get(timestampHeader);
    const signature = request.headers.get(signatureHeader);
    const webhookId = request.headers.get(idHeader);
    
    // Get body
    const body = await request.text();

    // Validate timestamp
    if (timestamp) {
      const webhookTime = parseInt(timestamp);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (isNaN(webhookTime)) {
        return { valid: false, error: 'Invalid timestamp format' };
      }
      
      if (currentTime - webhookTime > maxAgeSeconds) {
        return { valid: false, error: 'Webhook timestamp too old' };
      }
      
      if (webhookTime > currentTime + 60) { // Allow 1 minute clock skew
        return { valid: false, error: 'Webhook timestamp in the future' };
      }
    }

    // Check for replay attack
    if (webhookId) {
      if (processedWebhooks.has(webhookId)) {
        return { valid: false, error: 'Webhook already processed (replay attack prevention)' };
      }
      processedWebhooks.set(webhookId, Date.now());
    }

    // Validate signature
    if (!signature) {
      return { valid: false, error: 'Missing webhook signature' };
    }

    // Create signature
    const payload = timestamp ? `${timestamp}.${body}` : body;
    const expectedSignature = crypto
      .createHmac(algorithm, secret)
      .update(payload)
      .digest('hex');

    // Compare signatures
    const valid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!valid) {
      return { valid: false, error: 'Invalid webhook signature' };
    }

    return { valid: true, body };
  } catch (error) {
    console.error('Webhook validation error:', error);
    return { valid: false, error: 'Webhook validation failed' };
  }
}

/**
 * Stripe webhook validation
 */
export async function validateStripeWebhook(
  request: Request,
  endpointSecret: string
): Promise<{ valid: boolean; error?: string; event?: any }> {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      return { valid: false, error: 'Missing Stripe signature' };
    }

    // Parse Stripe signature header
    const elements = signature.split(',').reduce((acc, item) => {
      const [key, value] = item.split('=');
      if (key === 't') acc.timestamp = value;
      if (key === 'v1') acc.signature = value;
      return acc;
    }, {} as { timestamp?: string; signature?: string });

    if (!elements.timestamp || !elements.signature) {
      return { valid: false, error: 'Invalid Stripe signature format' };
    }

    // Verify timestamp
    const timestamp = parseInt(elements.timestamp);
    const currentTime = Math.floor(Date.now() / 1000);
    const tolerance = 300; // 5 minutes

    if (currentTime - timestamp > tolerance) {
      return { valid: false, error: 'Stripe webhook timestamp too old' };
    }

    // Verify signature
    const payload = `${elements.timestamp}.${body}`;
    const expectedSignature = crypto
      .createHmac('sha256', endpointSecret)
      .update(payload)
      .digest('hex');

    const valid = crypto.timingSafeEqual(
      Buffer.from(elements.signature),
      Buffer.from(expectedSignature)
    );

    if (!valid) {
      return { valid: false, error: 'Invalid Stripe signature' };
    }

    const event = JSON.parse(body);
    return { valid: true, event };
  } catch (error) {
    console.error('Stripe webhook validation error:', error);
    return { valid: false, error: 'Stripe webhook validation failed' };
  }
}

/**
 * Shopify webhook validation
 */
export async function validateShopifyWebhook(
  request: Request,
  secret: string
): Promise<{ valid: boolean; error?: string; body?: any }> {
  try {
    const body = await request.text();
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');
    
    if (!hmacHeader) {
      return { valid: false, error: 'Missing Shopify HMAC header' };
    }

    // Calculate HMAC
    const hash = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('base64');

    // Compare HMACs
    const valid = crypto.timingSafeEqual(
      Buffer.from(hmacHeader),
      Buffer.from(hash)
    );

    if (!valid) {
      return { valid: false, error: 'Invalid Shopify HMAC' };
    }

    // Check timestamp to prevent replay attacks
    const timestampHeader = request.headers.get('x-shopify-webhook-timestamp');
    if (timestampHeader) {
      const webhookTime = parseInt(timestampHeader);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (currentTime - webhookTime > 300) { // 5 minutes
        return { valid: false, error: 'Shopify webhook too old' };
      }
    }

    const parsedBody = JSON.parse(body);
    return { valid: true, body: parsedBody };
  } catch (error) {
    console.error('Shopify webhook validation error:', error);
    return { valid: false, error: 'Shopify webhook validation failed' };
  }
}

/**
 * SendGrid webhook validation
 */
export async function validateSendGridWebhook(
  request: Request,
  verificationKey: string
): Promise<{ valid: boolean; error?: string; events?: any[] }> {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-twilio-email-event-webhook-signature');
    const timestamp = request.headers.get('x-twilio-email-event-webhook-timestamp');
    
    if (!signature || !timestamp) {
      return { valid: false, error: 'Missing SendGrid webhook headers' };
    }

    // Verify timestamp
    const webhookTime = parseInt(timestamp);
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (currentTime - webhookTime > 300) { // 5 minutes
      return { valid: false, error: 'SendGrid webhook too old' };
    }

    // Create signature
    const payload = timestamp + body;
    const expectedSignature = crypto
      .createHmac('sha256', verificationKey)
      .update(payload)
      .digest('base64');

    // Compare signatures
    const valid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!valid) {
      return { valid: false, error: 'Invalid SendGrid signature' };
    }

    const events = JSON.parse(body);
    return { valid: true, events };
  } catch (error) {
    console.error('SendGrid webhook validation error:', error);
    return { valid: false, error: 'SendGrid webhook validation failed' };
  }
}