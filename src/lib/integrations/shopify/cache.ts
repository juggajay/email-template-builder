/**
 * Shopify Data Caching Layer
 */

import { createClient } from '@/lib/supabase/server';
import type {
  ShopifyProduct,
  ShopifyCustomer,
  ShopifyOrder,
  ShopifyAbandonedCart,
  ShopifyConnection
} from './types';

export class ShopifyCache {
  private shopId: string;

  constructor(shopId: string) {
    this.shopId = shopId;
  }

  /**
   * Products Cache
   */
  async upsertProducts(products: ShopifyProduct[]) {
    const supabase = createClient();
    
    const productsData = products.map(product => ({
      shop_id: this.shopId,
      shopify_product_id: product.shopifyProductId,
      title: product.title,
      description: product.description,
      vendor: product.vendor,
      product_type: product.productType,
      tags: product.tags,
      status: product.status,
      images: product.images,
      variants: product.variants,
      options: product.options,
      collections: product.collections,
      seo: product.seo,
      shopify_created_at: product.createdAt,
      shopify_updated_at: product.updatedAt
    }));

    const { error } = await supabase
      .from('shopify_products')
      .upsert(productsData, {
        onConflict: 'shop_id,shopify_product_id'
      });

    if (error) throw error;
    return products.length;
  }

  async getProducts(limit: number = 50, offset: number = 0) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('shopify_products')
      .select('*')
      .eq('shop_id', this.shopId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  async getProductById(productId: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('shopify_products')
      .select('*')
      .eq('shop_id', this.shopId)
      .eq('shopify_product_id', productId)
      .single();

    if (error) throw error;
    return data;
  }

  async searchProducts(query: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('shopify_products')
      .select('*')
      .eq('shop_id', this.shopId)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data;
  }

  /**
   * Customers Cache
   */
  async upsertCustomers(customers: ShopifyCustomer[]) {
    const supabase = createClient();
    
    const customersData = customers.map(customer => ({
      shop_id: this.shopId,
      shopify_customer_id: customer.shopifyCustomerId,
      email: customer.email,
      first_name: customer.firstName,
      last_name: customer.lastName,
      phone: customer.phone,
      tags: customer.tags,
      total_spent: customer.totalSpent,
      orders_count: customer.ordersCount,
      accepts_marketing: customer.acceptsMarketing,
      marketing_opt_in_level: customer.marketingOptInLevel,
      sms_marketing_consent: customer.smsMarketingConsent,
      addresses: customer.addresses,
      default_address: customer.defaultAddress,
      shopify_created_at: customer.createdAt,
      shopify_updated_at: customer.updatedAt
    }));

    const { error } = await supabase
      .from('shopify_customers')
      .upsert(customersData, {
        onConflict: 'shop_id,shopify_customer_id'
      });

    if (error) throw error;
    return customers.length;
  }

  async getCustomers(limit: number = 50, offset: number = 0) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('shopify_customers')
      .select('*')
      .eq('shop_id', this.shopId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  async getCustomersByTag(tag: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('shopify_customers')
      .select('*')
      .eq('shop_id', this.shopId)
      .contains('tags', [tag]);

    if (error) throw error;
    return data;
  }

  async getCustomerSegments() {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('shopify_customer_segments')
      .select('*')
      .eq('shop_id', this.shopId)
      .order('name');

    if (error) throw error;
    return data;
  }

  async upsertCustomerSegment(segment: {
    name: string;
    query: string;
    customerCount: number;
  }) {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('shopify_customer_segments')
      .upsert({
        shop_id: this.shopId,
        name: segment.name,
        query: segment.query,
        customer_count: segment.customerCount,
        last_updated: new Date().toISOString()
      });

    if (error) throw error;
  }

  /**
   * Abandoned Carts Cache
   */
  async upsertAbandonedCarts(carts: ShopifyAbandonedCart[]) {
    const supabase = createClient();
    
    const cartsData = carts.map(cart => ({
      shop_id: this.shopId,
      shopify_checkout_id: cart.shopifyCheckoutId,
      customer_id: cart.customerId,
      email: cart.email,
      phone: cart.phone,
      line_items: cart.lineItems,
      subtotal_price: cart.subtotalPrice,
      total_price: cart.totalPrice,
      total_tax: cart.totalTax,
      currency: cart.currency,
      abandoned_checkout_url: cart.abandonedCheckoutUrl,
      cart_token: cart.cartToken,
      completed_at: cart.completedAt,
      closed_at: cart.closedAt,
      shopify_created_at: cart.createdAt,
      shopify_updated_at: cart.updatedAt
    }));

    const { error } = await supabase
      .from('shopify_abandoned_carts')
      .upsert(cartsData, {
        onConflict: 'shop_id,shopify_checkout_id'
      });

    if (error) throw error;
    return carts.length;
  }

  async getAbandonedCarts(limit: number = 50, offset: number = 0) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('shopify_abandoned_carts')
      .select('*')
      .eq('shop_id', this.shopId)
      .is('completed_at', null)
      .is('closed_at', null)
      .order('shopify_created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  async getAbandonedCartByEmail(email: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('shopify_abandoned_carts')
      .select('*')
      .eq('shop_id', this.shopId)
      .eq('email', email)
      .is('completed_at', null)
      .order('shopify_created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data?.[0];
  }

  /**
   * Orders Cache
   */
  async upsertOrders(orders: ShopifyOrder[]) {
    const supabase = createClient();
    
    const ordersData = orders.map(order => ({
      shop_id: this.shopId,
      shopify_order_id: order.shopifyOrderId,
      order_number: order.orderNumber,
      customer_id: order.customerId,
      email: order.email,
      financial_status: order.financialStatus,
      fulfillment_status: order.fulfillmentStatus,
      line_items: order.lineItems,
      shipping_address: order.shippingAddress,
      billing_address: order.billingAddress,
      subtotal_price: order.subtotalPrice,
      total_price: order.totalPrice,
      total_tax: order.totalTax,
      total_discounts: order.totalDiscounts,
      currency: order.currency,
      tags: order.tags,
      note: order.note,
      tracking_numbers: order.trackingNumbers,
      shopify_created_at: order.createdAt,
      shopify_processed_at: order.processedAt
    }));

    const { error } = await supabase
      .from('shopify_orders')
      .upsert(ordersData, {
        onConflict: 'shop_id,shopify_order_id'
      });

    if (error) throw error;
    return orders.length;
  }

  async getOrders(limit: number = 50, offset: number = 0) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('shop_id', this.shopId)
      .order('shopify_created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  async getOrdersByCustomer(customerId: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('shop_id', this.shopId)
      .eq('customer_id', customerId)
      .order('shopify_created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Sync Management
   */
  async startSync(syncType: 'products' | 'customers' | 'orders' | 'carts') {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('shopify_sync_logs')
      .insert({
        shop_id: this.shopId,
        sync_type: syncType,
        status: 'started',
        records_synced: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async completeSync(syncId: string, recordsSynced: number) {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('shopify_sync_logs')
      .update({
        status: 'completed',
        records_synced: recordsSynced,
        completed_at: new Date().toISOString()
      })
      .eq('id', syncId);

    if (error) throw error;
  }

  async failSync(syncId: string, errorMessage: string) {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('shopify_sync_logs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString()
      })
      .eq('id', syncId);

    if (error) throw error;
  }

  async getLastSync(syncType?: string) {
    const supabase = createClient();
    
    let query = supabase
      .from('shopify_sync_logs')
      .select('*')
      .eq('shop_id', this.shopId)
      .eq('status', 'completed');

    if (syncType) {
      query = query.eq('sync_type', syncType);
    }

    const { data, error } = await query
      .order('completed_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data?.[0];
  }

  /**
   * Cache Management
   */
  async clearCache(type?: 'products' | 'customers' | 'orders' | 'carts') {
    const supabase = createClient();
    
    if (!type || type === 'products') {
      await supabase.from('shopify_products').delete().eq('shop_id', this.shopId);
    }
    if (!type || type === 'customers') {
      await supabase.from('shopify_customers').delete().eq('shop_id', this.shopId);
    }
    if (!type || type === 'orders') {
      await supabase.from('shopify_orders').delete().eq('shop_id', this.shopId);
    }
    if (!type || type === 'carts') {
      await supabase.from('shopify_abandoned_carts').delete().eq('shop_id', this.shopId);
    }
  }

  async getCacheStats() {
    const supabase = createClient();
    
    const [products, customers, orders, carts] = await Promise.all([
      supabase.from('shopify_products').select('id', { count: 'exact' }).eq('shop_id', this.shopId),
      supabase.from('shopify_customers').select('id', { count: 'exact' }).eq('shop_id', this.shopId),
      supabase.from('shopify_orders').select('id', { count: 'exact' }).eq('shop_id', this.shopId),
      supabase.from('shopify_abandoned_carts').select('id', { count: 'exact' }).eq('shop_id', this.shopId)
    ]);

    return {
      products: products.count || 0,
      customers: customers.count || 0,
      orders: orders.count || 0,
      carts: carts.count || 0
    };
  }
}