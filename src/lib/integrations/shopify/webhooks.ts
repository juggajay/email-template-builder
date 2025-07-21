/**
 * Shopify Webhook Handler
 */

import { createHmac } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { ShopifyCache } from './cache';
import type { ShopifyWebhookHeaders } from './types';

export class ShopifyWebhookHandler {
  private webhookSecret: string;

  constructor(webhookSecret: string) {
    this.webhookSecret = webhookSecret;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(body: string, headers: ShopifyWebhookHeaders): boolean {
    const hmac = headers['x-shopify-hmac-sha256'];
    const hash = createHmac('sha256', this.webhookSecret)
      .update(body, 'utf8')
      .digest('base64');

    return hash === hmac;
  }

  /**
   * Process webhook event
   */
  async processWebhook(
    topic: string,
    shopDomain: string,
    payload: any
  ): Promise<void> {
    const supabase = createClient();

    // Get shop connection
    const { data: shopConnection, error: shopError } = await supabase
      .from('shopify_connections')
      .select('id')
      .eq('shop_domain', shopDomain)
      .single();

    if (shopError || !shopConnection) {
      throw new Error(`Shop connection not found for ${shopDomain}`);
    }

    // Store webhook event
    const { data: webhookEvent, error: eventError } = await supabase
      .from('shopify_webhook_events')
      .insert({
        shop_id: shopConnection.id,
        topic,
        payload,
        processed: false
      })
      .select()
      .single();

    if (eventError) {
      throw new Error(`Failed to store webhook event: ${eventError.message}`);
    }

    try {
      // Process based on topic
      await this.handleWebhookTopic(topic, shopConnection.id, payload);

      // Mark as processed
      await supabase
        .from('shopify_webhook_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString()
        })
        .eq('id', webhookEvent.id);

    } catch (error) {
      // Mark as failed
      await supabase
        .from('shopify_webhook_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', webhookEvent.id);

      throw error;
    }
  }

  /**
   * Handle specific webhook topics
   */
  private async handleWebhookTopic(
    topic: string,
    shopId: string,
    payload: any
  ): Promise<void> {
    const cache = new ShopifyCache(shopId);

    switch (topic) {
      // Product events
      case 'products/create':
      case 'products/update':
        await this.handleProductUpdate(cache, payload);
        break;
      
      case 'products/delete':
        await this.handleProductDelete(cache, payload);
        break;

      // Customer events
      case 'customers/create':
      case 'customers/update':
        await this.handleCustomerUpdate(cache, payload);
        break;

      case 'customers/delete':
        await this.handleCustomerDelete(cache, payload);
        break;

      // Order events
      case 'orders/create':
      case 'orders/updated':
      case 'orders/paid':
        await this.handleOrderUpdate(cache, payload);
        break;

      case 'orders/cancelled':
        await this.handleOrderCancelled(cache, payload);
        break;

      // Checkout events
      case 'checkouts/create':
      case 'checkouts/update':
        await this.handleCheckoutUpdate(cache, payload);
        break;

      // Cart events (Plus stores only)
      case 'carts/create':
      case 'carts/update':
        await this.handleCartUpdate(cache, payload);
        break;

      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }
  }

  /**
   * Product webhook handlers
   */
  private async handleProductUpdate(cache: ShopifyCache, payload: any) {
    const product = this.transformProductPayload(payload);
    await cache.upsertProducts([product]);
  }

  private async handleProductDelete(cache: ShopifyCache, payload: any) {
    const supabase = createClient();
    await supabase
      .from('shopify_products')
      .delete()
      .eq('shopify_product_id', `gid://shopify/Product/${payload.id}`);
  }

  /**
   * Customer webhook handlers
   */
  private async handleCustomerUpdate(cache: ShopifyCache, payload: any) {
    const customer = this.transformCustomerPayload(payload);
    await cache.upsertCustomers([customer]);
  }

  private async handleCustomerDelete(cache: ShopifyCache, payload: any) {
    const supabase = createClient();
    await supabase
      .from('shopify_customers')
      .delete()
      .eq('shopify_customer_id', `gid://shopify/Customer/${payload.id}`);
  }

  /**
   * Order webhook handlers
   */
  private async handleOrderUpdate(cache: ShopifyCache, payload: any) {
    const order = this.transformOrderPayload(payload);
    await cache.upsertOrders([order]);
  }

  private async handleOrderCancelled(cache: ShopifyCache, payload: any) {
    const order = this.transformOrderPayload(payload);
    order.financialStatus = 'voided';
    await cache.upsertOrders([order]);
  }

  /**
   * Checkout webhook handlers
   */
  private async handleCheckoutUpdate(cache: ShopifyCache, payload: any) {
    // Only process if checkout is abandoned (not completed)
    if (!payload.completed_at && !payload.closed_at) {
      const cart = this.transformCheckoutPayload(payload);
      await cache.upsertAbandonedCarts([cart]);
    }
  }

  /**
   * Cart webhook handlers (Plus stores)
   */
  private async handleCartUpdate(cache: ShopifyCache, payload: any) {
    const cart = this.transformCartPayload(payload);
    await cache.upsertAbandonedCarts([cart]);
  }

  /**
   * Transform webhook payloads to our types
   */
  private transformProductPayload(payload: any): any {
    return {
      shopifyProductId: `gid://shopify/Product/${payload.id}`,
      title: payload.title,
      description: payload.body_html,
      vendor: payload.vendor,
      productType: payload.product_type,
      tags: payload.tags ? payload.tags.split(', ') : [],
      status: payload.status,
      images: payload.images?.map((img: any) => ({
        id: img.id.toString(),
        url: img.src,
        altText: img.alt,
        width: img.width,
        height: img.height,
        position: img.position
      })) || [],
      variants: payload.variants?.map((variant: any) => ({
        id: `gid://shopify/ProductVariant/${variant.id}`,
        title: variant.title,
        price: variant.price,
        compareAtPrice: variant.compare_at_price,
        sku: variant.sku,
        barcode: variant.barcode,
        inventoryQuantity: variant.inventory_quantity,
        weight: variant.weight,
        weightUnit: variant.weight_unit,
        selectedOptions: []
      })) || [],
      options: payload.options?.map((option: any) => ({
        id: option.id.toString(),
        name: option.name,
        position: option.position,
        values: option.values
      })) || [],
      collections: [],
      createdAt: new Date(payload.created_at),
      updatedAt: new Date(payload.updated_at)
    };
  }

  private transformCustomerPayload(payload: any): any {
    return {
      shopifyCustomerId: `gid://shopify/Customer/${payload.id}`,
      email: payload.email,
      firstName: payload.first_name,
      lastName: payload.last_name,
      phone: payload.phone,
      tags: payload.tags ? payload.tags.split(', ') : [],
      totalSpent: parseFloat(payload.total_spent || '0'),
      ordersCount: payload.orders_count || 0,
      acceptsMarketing: payload.accepts_marketing,
      marketingOptInLevel: payload.marketing_opt_in_level,
      smsMarketingConsent: payload.sms_marketing_consent,
      addresses: payload.addresses || [],
      defaultAddress: payload.default_address,
      createdAt: new Date(payload.created_at),
      updatedAt: new Date(payload.updated_at)
    };
  }

  private transformOrderPayload(payload: any): any {
    return {
      shopifyOrderId: `gid://shopify/Order/${payload.id}`,
      orderNumber: payload.name,
      customerId: payload.customer?.id ? `gid://shopify/Customer/${payload.customer.id}` : null,
      email: payload.email || payload.customer?.email,
      financialStatus: payload.financial_status,
      fulfillmentStatus: payload.fulfillment_status,
      lineItems: payload.line_items?.map((item: any) => ({
        id: item.id.toString(),
        variantId: item.variant_id ? `gid://shopify/ProductVariant/${item.variant_id}` : null,
        productId: item.product_id ? `gid://shopify/Product/${item.product_id}` : null,
        title: item.title,
        variantTitle: item.variant_title,
        quantity: item.quantity,
        price: item.price,
        totalDiscount: item.total_discount,
        sku: item.sku,
        vendor: item.vendor,
        fulfillmentStatus: item.fulfillment_status
      })) || [],
      shippingAddress: payload.shipping_address,
      billingAddress: payload.billing_address,
      subtotalPrice: parseFloat(payload.subtotal_price || '0'),
      totalPrice: parseFloat(payload.total_price || '0'),
      totalTax: parseFloat(payload.total_tax || '0'),
      totalDiscounts: parseFloat(payload.total_discounts || '0'),
      currency: payload.currency,
      tags: payload.tags ? payload.tags.split(', ') : [],
      note: payload.note,
      trackingNumbers: [],
      createdAt: new Date(payload.created_at),
      processedAt: new Date(payload.processed_at || payload.created_at)
    };
  }

  private transformCheckoutPayload(payload: any): any {
    return {
      shopifyCheckoutId: payload.id,
      customerId: payload.customer?.id ? `gid://shopify/Customer/${payload.customer.id}` : null,
      email: payload.email,
      phone: payload.phone,
      lineItems: payload.line_items?.map((item: any) => ({
        id: item.id,
        variantId: item.variant_id,
        productId: item.product_id,
        title: item.title,
        variantTitle: item.variant_title,
        quantity: item.quantity,
        price: item.price,
        compareAtPrice: item.compare_at_price,
        linePrice: item.line_price,
        image: item.image_url,
        sku: item.sku,
        vendor: item.vendor,
        properties: item.properties
      })) || [],
      subtotalPrice: parseFloat(payload.subtotal_price || '0'),
      totalPrice: parseFloat(payload.total_price || '0'),
      totalTax: parseFloat(payload.total_tax || '0'),
      currency: payload.currency,
      abandonedCheckoutUrl: payload.abandoned_checkout_url,
      cartToken: payload.cart_token,
      completedAt: payload.completed_at ? new Date(payload.completed_at) : null,
      closedAt: payload.closed_at ? new Date(payload.closed_at) : null,
      createdAt: new Date(payload.created_at),
      updatedAt: new Date(payload.updated_at)
    };
  }

  private transformCartPayload(payload: any): any {
    // Transform cart payload (similar to checkout but different structure)
    return {
      shopifyCheckoutId: payload.token, // Using cart token as ID
      customerId: payload.user_id ? `gid://shopify/Customer/${payload.user_id}` : null,
      email: null, // Cart doesn't have email
      phone: null,
      lineItems: payload.line_items?.map((item: any) => ({
        id: item.id,
        variantId: item.variant_id,
        productId: item.product_id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        linePrice: (parseFloat(item.price) * item.quantity).toFixed(2),
        properties: item.properties
      })) || [],
      subtotalPrice: parseFloat(payload.total_price || '0'),
      totalPrice: parseFloat(payload.total_price || '0'),
      totalTax: 0, // Cart doesn't calculate tax
      currency: payload.currency || 'USD',
      abandonedCheckoutUrl: null, // Cart doesn't have checkout URL
      cartToken: payload.token,
      completedAt: null,
      closedAt: null,
      createdAt: new Date(payload.created_at),
      updatedAt: new Date(payload.updated_at)
    };
  }
}

/**
 * Webhook topic types that we support
 */
export const SHOPIFY_WEBHOOK_TOPICS = [
  'products/create',
  'products/update',
  'products/delete',
  'customers/create',
  'customers/update',
  'customers/delete',
  'orders/create',
  'orders/updated',
  'orders/paid',
  'orders/cancelled',
  'orders/fulfilled',
  'checkouts/create',
  'checkouts/update',
  'carts/create',
  'carts/update'
] as const;

export type ShopifyWebhookTopic = typeof SHOPIFY_WEBHOOK_TOPICS[number];