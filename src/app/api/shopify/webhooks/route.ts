import { NextRequest, NextResponse } from 'next/server';
import { ShopifyWebhookHandler } from '@/lib/integrations/shopify/webhooks';
import { parseWebhookHeaders } from '@/lib/integrations/shopify/utils';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Parse webhook headers
    const webhookHeaders = parseWebhookHeaders(request.headers);
    
    if (!webhookHeaders.topic || !webhookHeaders.hmac || !webhookHeaders.shopDomain) {
      return NextResponse.json(
        { error: 'Missing required webhook headers' },
        { status: 400 }
      );
    }

    // Get raw body for HMAC verification
    const rawBody = await request.text();
    
    // Get shop's webhook secret
    const supabase = createClient();
    const { data: connection, error: connectionError } = await supabase
      .from('shopify_connections')
      .select('webhook_secret')
      .eq('shop_domain', webhookHeaders.shopDomain)
      .single();

    if (connectionError || !connection?.webhook_secret) {
      console.error('Shop connection not found:', webhookHeaders.shopDomain);
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Verify webhook
    const handler = new ShopifyWebhookHandler(connection.webhook_secret);
    const isValid = handler.verifyWebhook(rawBody, {
      'x-shopify-topic': webhookHeaders.topic,
      'x-shopify-hmac-sha256': webhookHeaders.hmac,
      'x-shopify-shop-domain': webhookHeaders.shopDomain,
      'x-shopify-api-version': webhookHeaders.apiVersion,
      'x-shopify-webhook-id': webhookHeaders.webhookId
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse JSON payload
    const payload = JSON.parse(rawBody);

    // Process webhook asynchronously
    handler.processWebhook(
      webhookHeaders.topic,
      webhookHeaders.shopDomain,
      payload
    ).catch(error => {
      console.error('Webhook processing error:', error);
    });

    // Return success immediately
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Webhook verification endpoint for Shopify
export async function GET(request: NextRequest) {
  // Shopify sends a verification request when setting up webhooks
  return NextResponse.json({ status: 'ok' });
}