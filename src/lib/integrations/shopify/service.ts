/**
 * Main Shopify Integration Service
 */

import { createClient } from '@/lib/supabase/server';
import { ShopifyClient } from './client';
import { ShopifyCache } from './cache';
import { ShopifyWebhookHandler, SHOPIFY_WEBHOOK_TOPICS } from './webhooks';
import { 
  buildAuthUrl, 
  generateOAuthState, 
  verifyHmac, 
  exchangeCodeForToken,
  shouldSync,
  RateLimiter
} from './utils';
import type { 
  ShopifyConnection,
  ShopifyProduct,
  ShopifyCustomer,
  ShopifyOrder,
  ShopifyAbandonedCart
} from './types';

export class ShopifyService {
  private connection: ShopifyConnection;
  private client: ShopifyClient;
  private cache: ShopifyCache;
  private rateLimiter: RateLimiter;

  constructor(connection: ShopifyConnection) {
    this.connection = connection;
    this.client = new ShopifyClient(connection.shopDomain, connection.accessToken);
    this.cache = new ShopifyCache(connection.id);
    this.rateLimiter = new RateLimiter();
  }

  /**
   * Static methods for OAuth flow
   */
  static generateAuthUrl(shop: string, redirectUrl: string): {
    authUrl: string;
    state: string;
  } {
    const state = generateOAuthState();
    const scopes = [
      'read_products',
      'write_products',
      'read_customers',
      'write_customers',
      'read_orders',
      'write_orders',
      'read_checkouts',
      'write_checkouts',
      'read_inventory',
      'write_inventory'
    ];

    const authUrl = buildAuthUrl(
      shop,
      process.env.SHOPIFY_CLIENT_ID!,
      redirectUrl,
      scopes,
      state
    );

    return { authUrl, state };
  }

  static async verifyCallback(
    params: Record<string, string>
  ): Promise<boolean> {
    return verifyHmac(params, process.env.SHOPIFY_CLIENT_SECRET!);
  }

  static async completeOAuth(
    shop: string,
    code: string,
    userId: string
  ): Promise<ShopifyConnection> {
    // Exchange code for token
    const tokenData = await exchangeCodeForToken(
      shop,
      code,
      process.env.SHOPIFY_CLIENT_ID!,
      process.env.SHOPIFY_CLIENT_SECRET!
    );

    // Get shop info
    const tempClient = new ShopifyClient(shop, tokenData.access_token);
    const shopInfo = await tempClient.getShopInfo();

    // Save connection
    const supabase = createClient();
    const { data, error } = await supabase
      .from('shopify_connections')
      .insert({
        user_id: userId,
        shop_domain: shop,
        access_token: tokenData.access_token,
        shop_name: shopInfo.name,
        shop_email: shopInfo.email || shopInfo.contactEmail,
        shop_owner: tokenData.associated_user?.first_name 
          ? `${tokenData.associated_user.first_name} ${tokenData.associated_user.last_name}`
          : null,
        shop_plan: shopInfo.plan?.displayName,
        shop_created_at: shopInfo.createdAt,
        scopes: tokenData.scope.split(','),
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get connection for user
   */
  static async getConnection(userId: string): Promise<ShopifyConnection | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('shopify_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return data;
  }

  /**
   * Sync methods
   */
  async syncProducts(forceSync = false): Promise<number> {
    if (!forceSync) {
      const lastSync = await this.cache.getLastSync('products');
      if (lastSync && !shouldSync(lastSync.completed_at, 'products')) {
        return 0;
      }
    }

    const syncId = await this.cache.startSync('products');
    let totalSynced = 0;
    let hasNextPage = true;
    let cursor: string | undefined;

    try {
      while (hasNextPage) {
        await this.rateLimiter.throttle();
        
        const response = await this.client.getProducts(250, cursor);
        const products = response.edges.map((edge: any) => this.transformProduct(edge.node));
        
        if (products.length > 0) {
          await this.cache.upsertProducts(products);
          totalSynced += products.length;
        }

        hasNextPage = response.pageInfo.hasNextPage;
        cursor = response.pageInfo.endCursor;
      }

      await this.cache.completeSync(syncId, totalSynced);
      return totalSynced;

    } catch (error) {
      await this.cache.failSync(syncId, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async syncCustomers(forceSync = false): Promise<number> {
    if (!forceSync) {
      const lastSync = await this.cache.getLastSync('customers');
      if (lastSync && !shouldSync(lastSync.completed_at, 'customers')) {
        return 0;
      }
    }

    const syncId = await this.cache.startSync('customers');
    let totalSynced = 0;
    let hasNextPage = true;
    let cursor: string | undefined;

    try {
      while (hasNextPage) {
        await this.rateLimiter.throttle();
        
        const response = await this.client.getCustomers(250, cursor);
        const customers = response.edges.map((edge: any) => this.transformCustomer(edge.node));
        
        if (customers.length > 0) {
          await this.cache.upsertCustomers(customers);
          totalSynced += customers.length;
        }

        hasNextPage = response.pageInfo.hasNextPage;
        cursor = response.pageInfo.endCursor;
      }

      await this.cache.completeSync(syncId, totalSynced);
      return totalSynced;

    } catch (error) {
      await this.cache.failSync(syncId, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async syncAbandonedCarts(forceSync = false): Promise<number> {
    if (!forceSync) {
      const lastSync = await this.cache.getLastSync('carts');
      if (lastSync && !shouldSync(lastSync.completed_at, 'carts')) {
        return 0;
      }
    }

    const syncId = await this.cache.startSync('carts');
    let totalSynced = 0;
    let hasNextPage = true;
    let cursor: string | undefined;

    try {
      while (hasNextPage) {
        await this.rateLimiter.throttle();
        
        const response = await this.client.getAbandonedCheckouts(250, cursor);
        const carts = response.edges.map((edge: any) => this.transformAbandonedCart(edge.node));
        
        if (carts.length > 0) {
          await this.cache.upsertAbandonedCarts(carts);
          totalSynced += carts.length;
        }

        hasNextPage = response.pageInfo.hasNextPage;
        cursor = response.pageInfo.endCursor;
      }

      await this.cache.completeSync(syncId, totalSynced);
      return totalSynced;

    } catch (error) {
      await this.cache.failSync(syncId, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async syncOrders(forceSync = false): Promise<number> {
    if (!forceSync) {
      const lastSync = await this.cache.getLastSync('orders');
      if (lastSync && !shouldSync(lastSync.completed_at, 'orders')) {
        return 0;
      }
    }

    const syncId = await this.cache.startSync('orders');
    let totalSynced = 0;
    let hasNextPage = true;
    let cursor: string | undefined;

    try {
      // Sync recent orders (last 30 days by default)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const query = `created_at:>='${thirtyDaysAgo.toISOString()}'`;

      while (hasNextPage) {
        await this.rateLimiter.throttle();
        
        const response = await this.client.getOrders(250, cursor, query);
        const orders = response.edges.map((edge: any) => this.transformOrder(edge.node));
        
        if (orders.length > 0) {
          await this.cache.upsertOrders(orders);
          totalSynced += orders.length;
        }

        hasNextPage = response.pageInfo.hasNextPage;
        cursor = response.pageInfo.endCursor;
      }

      await this.cache.completeSync(syncId, totalSynced);
      return totalSynced;

    } catch (error) {
      await this.cache.failSync(syncId, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async syncAll(): Promise<{
    products: number;
    customers: number;
    carts: number;
    orders: number;
  }> {
    const results = await Promise.all([
      this.syncProducts(),
      this.syncCustomers(),
      this.syncAbandonedCarts(),
      this.syncOrders()
    ]);

    return {
      products: results[0],
      customers: results[1],
      carts: results[2],
      orders: results[3]
    };
  }

  /**
   * Setup webhooks
   */
  async setupWebhooks(baseUrl: string): Promise<void> {
    const existingWebhooks = await this.client.listWebhooks();
    const existingTopics = new Set(
      existingWebhooks.edges.map((edge: any) => edge.node.topic)
    );

    for (const topic of SHOPIFY_WEBHOOK_TOPICS) {
      if (!existingTopics.has(topic)) {
        await this.rateLimiter.throttle();
        await this.client.createWebhook(
          topic,
          `${baseUrl}/api/shopify/webhooks`
        );
      }
    }
  }

  /**
   * Data access methods
   */
  async getProducts(limit = 50, offset = 0) {
    return this.cache.getProducts(limit, offset);
  }

  async searchProducts(query: string) {
    return this.cache.searchProducts(query);
  }

  async getProductById(productId: string) {
    return this.cache.getProductById(productId);
  }

  async getCustomers(limit = 50, offset = 0) {
    return this.cache.getCustomers(limit, offset);
  }

  async getCustomersByTag(tag: string) {
    return this.cache.getCustomersByTag(tag);
  }

  async getCustomerSegments() {
    return this.cache.getCustomerSegments();
  }

  async getAbandonedCarts(limit = 50, offset = 0) {
    return this.cache.getAbandonedCarts(limit, offset);
  }

  async getAbandonedCartByEmail(email: string) {
    return this.cache.getAbandonedCartByEmail(email);
  }

  async getOrders(limit = 50, offset = 0) {
    return this.cache.getOrders(limit, offset);
  }

  async getOrdersByCustomer(customerId: string) {
    return this.cache.getOrdersByCustomer(customerId);
  }

  /**
   * Transform GraphQL responses to our types
   */
  private transformProduct(product: any): ShopifyProduct {
    return {
      id: '',
      shopifyProductId: product.id,
      title: product.title,
      description: product.description,
      vendor: product.vendor,
      productType: product.productType,
      tags: product.tags || [],
      status: product.status.toLowerCase(),
      images: product.images?.edges.map((edge: any) => edge.node) || [],
      variants: product.variants?.edges.map((edge: any) => edge.node) || [],
      options: product.options || [],
      collections: product.collections?.edges.map((edge: any) => edge.node.title) || [],
      seo: product.seo,
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt)
    };
  }

  private transformCustomer(customer: any): ShopifyCustomer {
    return {
      id: '',
      shopifyCustomerId: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      tags: customer.tags || [],
      totalSpent: parseFloat(customer.totalSpent || '0'),
      ordersCount: customer.ordersCount || 0,
      acceptsMarketing: customer.acceptsMarketing,
      marketingOptInLevel: customer.marketingOptInLevel,
      smsMarketingConsent: customer.smsMarketingConsent,
      addresses: customer.addresses || [],
      defaultAddress: customer.defaultAddress,
      createdAt: new Date(customer.createdAt),
      updatedAt: new Date(customer.updatedAt)
    };
  }

  private transformAbandonedCart(checkout: any): ShopifyAbandonedCart {
    return {
      id: '',
      shopifyCheckoutId: checkout.id,
      customerId: checkout.customer?.id,
      email: checkout.email,
      phone: checkout.phone,
      lineItems: checkout.lineItems?.edges.map((edge: any) => ({
        ...edge.node,
        linePrice: edge.node.linePrice || (parseFloat(edge.node.price) * edge.node.quantity).toString()
      })) || [],
      subtotalPrice: parseFloat(checkout.subtotalPrice || '0'),
      totalPrice: parseFloat(checkout.totalPrice || '0'),
      totalTax: parseFloat(checkout.totalTax || '0'),
      currency: checkout.currency,
      abandonedCheckoutUrl: checkout.abandonedCheckoutUrl,
      cartToken: checkout.cartToken,
      completedAt: checkout.completedAt ? new Date(checkout.completedAt) : undefined,
      closedAt: checkout.closedAt ? new Date(checkout.closedAt) : undefined,
      createdAt: new Date(checkout.createdAt),
      updatedAt: new Date(checkout.updatedAt)
    };
  }

  private transformOrder(order: any): ShopifyOrder {
    return {
      id: '',
      shopifyOrderId: order.id,
      orderNumber: order.name,
      customerId: order.customer?.id,
      email: order.email,
      financialStatus: order.financialStatus.toLowerCase(),
      fulfillmentStatus: order.fulfillmentStatus?.toLowerCase() || null,
      lineItems: order.lineItems?.edges.map((edge: any) => edge.node) || [],
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      subtotalPrice: parseFloat(order.subtotalPrice || '0'),
      totalPrice: parseFloat(order.totalPrice || '0'),
      totalTax: parseFloat(order.totalTax || '0'),
      totalDiscounts: parseFloat(order.totalDiscounts || '0'),
      currency: order.currencyCode,
      tags: order.tags || [],
      note: order.note,
      trackingNumbers: order.fulfillments?.flatMap((f: any) => f.trackingNumbers || []) || [],
      createdAt: new Date(order.createdAt),
      processedAt: new Date(order.processedAt || order.createdAt)
    };
  }
}