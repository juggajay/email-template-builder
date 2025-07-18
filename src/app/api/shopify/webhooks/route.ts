import { NextRequest, NextResponse } from 'next/server';
import { ShopifyWebhookHandler } from '@/lib/integrations/shopify/webhooks';
import { parseWebhookHeaders } from '@/lib/integrations/shopify/utils';
import { createClient } from '@/lib/supabase/server';
import { validateShopifyWebhook } from '@/lib/security/webhook-validation';
import { handleApiError } from '@/lib/security/error-handling';
import { logSecurityEvent, SecurityEventType, extractRequestMetadata } from '@/lib/security/monitoring';
import { withRateLimit, rateLimiters } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  // Apply rate limiting for webhooks
  const rateLimitResult = await withRateLimit(request, rateLimiters.webhook);
  if (rateLimitResult) return rateLimitResult;

  try {
    // Parse webhook headers
    const webhookHeaders = parseWebhookHeaders(request.headers);
    
    if (!webhookHeaders.topic || !webhookHeaders.hmac || !webhookHeaders.shopDomain) {
      return NextResponse.json(
        { error: 'Missing required webhook headers' },
        { status: 400 }
      );
    }

    // Get shop's webhook secret
    const supabase = createClient();
    const { data: connection, error: connectionError } = await supabase
      .from('shopify_connections')
      .select('webhook_secret')
      .eq('shop_domain', webhookHeaders.shopDomain)
      .single();

    if (connectionError || !connection?.webhook_secret) {
      // Log unauthorized webhook attempt
      await logSecurityEvent({
        type: SecurityEventType.WEBHOOK_FAILURE,
        ...extractRequestMetadata(request),
        action: 'shopify_webhook',
        result: 'failure',
        metadata: { 
          error: 'Shop not found',
          shop_domain: webhookHeaders.shopDomain
        }
      });

      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Use enhanced webhook validation
    const { valid, error, body } = await validateShopifyWebhook(
      request,
      connection.webhook_secret
    );

    if (!valid) {
      // Log failed webhook validation
      await logSecurityEvent({
        type: SecurityEventType.WEBHOOK_FAILURE,
        ...extractRequestMetadata(request),
        action: 'shopify_webhook_validation',
        result: 'failure',
        metadata: { 
          error,
          shop_domain: webhookHeaders.shopDomain,
          webhook_topic: webhookHeaders.topic
        }
      });

      return NextResponse.json(
        { error: error || 'Invalid webhook' },
        { status: 401 }
      );
    }

    const payload = body || JSON.parse(await request.text());

    // Create webhook handler
    const handler = new ShopifyWebhookHandler(connection.webhook_secret);

    // Process webhook asynchronously
    handler.processWebhook(
      webhookHeaders.topic,
      webhookHeaders.shopDomain,
      payload
    ).catch(error => {
      console.error('Webhook processing error:', error);
    });

    // Log successful webhook processing
    await logSecurityEvent({
      type: SecurityEventType.DATA_EXPORT,
      ...extractRequestMetadata(request),
      action: 'shopify_webhook',
      result: 'success',
      metadata: { 
        shop_domain: webhookHeaders.shopDomain,
        webhook_topic: webhookHeaders.topic,
        webhook_id: webhookHeaders.webhookId
      }
    });

    // Return success immediately
    return NextResponse.json({ success: true });

  } catch (error) {
    // Log webhook processing error
    await logSecurityEvent({
      type: SecurityEventType.WEBHOOK_FAILURE,
      ...extractRequestMetadata(request),
      action: 'shopify_webhook_processing',
      result: 'failure',
      metadata: { 
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    return handleApiError(error, {
      action: 'process_shopify_webhook',
      ...extractRequestMetadata(request)
    });
  }
}

// Webhook verification endpoint for Shopify
export async function GET(request: NextRequest) {
  // Shopify sends a verification request when setting up webhooks
  return NextResponse.json({ status: 'ok' });
}