import { NextRequest } from 'next/server';
import { validateShopifyWebhookHMAC, createGDPRResponse } from '@/lib/integrations/shopify/webhook-validation';
import { createClient } from '@/lib/supabase/server';

/**
 * GDPR webhook: customers/data_request
 * Called when a customer requests a copy of their data
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
    const dataRequestId = payload.data_request?.id;
    
    if (!shopDomain || !customerId || !dataRequestId) {
      return new Response('Bad Request', { status: 400 });
    }
    
    // In a production app, you would:
    // 1. Gather all customer data from your database
    // 2. Generate a report (JSON, CSV, etc.)
    // 3. Upload it to a secure location
    // 4. Send the URL to Shopify using the Admin API
    
    // For now, we'll just log the request
    console.log(`GDPR customers/data_request received:`, {
      shopDomain,
      customerId,
      customerEmail,
      dataRequestId
    });
    
    // Get customer data from database
    const supabase = createClient();
    
    const { data: connection } = await supabase
      .from('shopify_connections')
      .select('id')
      .eq('shop_domain', shopDomain)
      .single();
    
    if (connection) {
      // Collect customer data
      const { data: customerData } = await supabase
        .from('shopify_customers')
        .select('*')
        .eq('shop_id', connection.id)
        .eq('shopify_customer_id', customerId.toString())
        .single();
      
      const { data: orderData } = await supabase
        .from('shopify_orders')
        .select('*')
        .eq('shop_id', connection.id)
        .eq('customer_email', customerEmail);
      
      const { data: cartData } = await supabase
        .from('shopify_abandoned_carts')
        .select('*')
        .eq('shop_id', connection.id)
        .eq('customer_email', customerEmail);
      
      // In production, you would:
      // 1. Format this data
      // 2. Upload to secure storage
      // 3. Send URL to Shopify
      
      console.log('Customer data collected:', {
        customer: customerData,
        orders: orderData?.length || 0,
        carts: cartData?.length || 0
      });
    }
    
    // Return success - Shopify will handle notifying the customer
    return createGDPRResponse();
    
  } catch (error) {
    console.error('Error processing customers/data_request webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}