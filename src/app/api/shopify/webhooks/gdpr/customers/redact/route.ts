import { NextRequest } from 'next/server';
import { validateShopifyWebhookHMAC, createGDPRResponse } from '@/lib/integrations/shopify/webhook-validation';
import { createClient } from '@/lib/supabase/server';

/**
 * GDPR webhook: customers/redact
 * Called when a customer requests their data to be removed
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
    const customerId = payload.customer?.id;
    const customerEmail = payload.customer?.email;
    
    if (!shopDomain || !customerId) {
      return new Response('Bad Request', { status: 400 });
    }
    
    // Remove customer data from database
    const supabase = createClient();
    
    // Get shop connection
    const { data: connection } = await supabase
      .from('shopify_connections')
      .select('id')
      .eq('shop_domain', shopDomain)
      .single();
    
    if (connection) {
      // Delete customer data
      await supabase
        .from('shopify_customers')
        .delete()
        .eq('shop_id', connection.id)
        .eq('shopify_customer_id', customerId.toString());
      
      // Also delete any orders associated with this customer
      await supabase
        .from('shopify_orders')
        .delete()
        .eq('shop_id', connection.id)
        .eq('customer_email', customerEmail);
      
      // Delete abandoned carts
      await supabase
        .from('shopify_abandoned_carts')
        .delete()
        .eq('shop_id', connection.id)
        .eq('customer_email', customerEmail);
    }
    
    console.log(`GDPR customers/redact processed for customer ${customerId} in ${shopDomain}`);
    
    return createGDPRResponse();
    
  } catch (error) {
    console.error('Error processing customers/redact webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}