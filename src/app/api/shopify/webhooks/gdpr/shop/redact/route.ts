import { NextRequest } from 'next/server';
import { validateShopifyWebhookHMAC, createGDPRResponse } from '@/lib/integrations/shopify/webhook-validation';
import { createClient } from '@/lib/supabase/server';

/**
 * GDPR webhook: shop/redact
 * Called when a shop's data should be removed (48 hours after uninstall)
 */
export async function POST(request: NextRequest) {
  try {
    // Get HMAC header
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');
    
    // Get raw body
    const rawBody = await request.text();
    
    // Validate HMAC
    if (!validateShopifyWebhookHMAC(rawBody, hmacHeader)) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Parse the webhook payload
    const payload = JSON.parse(rawBody);
    const shopDomain = payload.shop_domain;
    
    if (!shopDomain) {
      return new Response('Bad Request', { status: 400 });
    }
    
    // Remove shop data from database
    const supabase = createClient();
    
    // Get shop connection
    const { data: connection } = await supabase
      .from('shopify_connections')
      .select('id')
      .eq('shop_domain', shopDomain)
      .single();
    
    if (connection) {
      // Delete all shop data in order (respecting foreign key constraints)
      await supabase.from('shopify_webhook_events').delete().eq('shop_id', connection.id);
      await supabase.from('shopify_sync_logs').delete().eq('shop_id', connection.id);
      await supabase.from('shopify_orders').delete().eq('shop_id', connection.id);
      await supabase.from('shopify_abandoned_carts').delete().eq('shop_id', connection.id);
      await supabase.from('shopify_customer_segments').delete().eq('shop_id', connection.id);
      await supabase.from('shopify_customers').delete().eq('shop_id', connection.id);
      await supabase.from('shopify_products').delete().eq('shop_id', connection.id);
      await supabase.from('shopify_connections').delete().eq('id', connection.id);
    }
    
    console.log(`GDPR shop/redact processed for ${shopDomain}`);
    
    return createGDPRResponse();
    
  } catch (error) {
    console.error('Error processing shop/redact webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}