/**
 * Shopify Integration Types
 */

// Connection types
export interface ShopifyConnection {
  id: string;
  userId: string;
  shopDomain: string;
  accessToken: string;
  shopName?: string;
  shopEmail?: string;
  shopOwner?: string;
  shopPlan?: string;
  shopCreatedAt?: Date;
  scopes?: string[];
  isActive: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Product types
export interface ShopifyProduct {
  id: string;
  shopifyProductId: string;
  title: string;
  description?: string;
  vendor?: string;
  productType?: string;
  tags: string[];
  status: 'active' | 'archived' | 'draft';
  images: ShopifyImage[];
  variants: ShopifyVariant[];
  options: ShopifyOption[];
  collections: string[];
  seo?: ShopifySEO;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopifyImage {
  id: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
  position?: number;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  sku?: string;
  barcode?: string;
  inventoryQuantity?: number;
  weight?: number;
  weightUnit?: string;
  image?: ShopifyImage;
  selectedOptions: { name: string; value: string }[];
}

export interface ShopifyOption {
  id: string;
  name: string;
  position: number;
  values: string[];
}

export interface ShopifySEO {
  title?: string;
  description?: string;
}

// Customer types
export interface ShopifyCustomer {
  id: string;
  shopifyCustomerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags: string[];
  totalSpent: number;
  ordersCount: number;
  acceptsMarketing: boolean;
  marketingOptInLevel?: string;
  smsMarketingConsent?: {
    state: string;
    optInLevel: string;
    consentUpdatedAt: Date;
  };
  addresses: ShopifyAddress[];
  defaultAddress?: ShopifyAddress;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopifyAddress {
  id?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
  default?: boolean;
}

// Customer segment types
export interface ShopifyCustomerSegment {
  id: string;
  shopId: string;
  name: string;
  query: string;
  customerCount: number;
  lastUpdated: Date;
  createdAt: Date;
}

// Abandoned cart types
export interface ShopifyAbandonedCart {
  id: string;
  shopifyCheckoutId: string;
  customerId?: string;
  email?: string;
  phone?: string;
  lineItems: ShopifyCartLineItem[];
  subtotalPrice: number;
  totalPrice: number;
  totalTax: number;
  currency: string;
  abandonedCheckoutUrl: string;
  cartToken?: string;
  completedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopifyCartLineItem {
  id: string;
  variantId: string;
  productId: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: string;
  compareAtPrice?: string;
  linePrice: string;
  image?: string;
  sku?: string;
  vendor?: string;
  properties?: Record<string, any>;
}

// Order types
export interface ShopifyOrder {
  id: string;
  shopifyOrderId: string;
  orderNumber: string;
  customerId?: string;
  email?: string;
  financialStatus: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided';
  fulfillmentStatus?: 'fulfilled' | 'partial' | 'unfulfilled' | null;
  lineItems: ShopifyOrderLineItem[];
  shippingAddress?: ShopifyAddress;
  billingAddress?: ShopifyAddress;
  subtotalPrice: number;
  totalPrice: number;
  totalTax: number;
  totalDiscounts: number;
  currency: string;
  tags: string[];
  note?: string;
  trackingNumbers: string[];
  createdAt: Date;
  processedAt: Date;
}

export interface ShopifyOrderLineItem {
  id: string;
  variantId?: string;
  productId?: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: string;
  totalDiscount: string;
  sku?: string;
  vendor?: string;
  fulfillmentStatus?: string;
  properties?: Record<string, any>;
}

// Sync types
export interface ShopifySyncLog {
  id: string;
  shopId: string;
  syncType: 'products' | 'customers' | 'orders' | 'carts';
  status: 'started' | 'completed' | 'failed';
  recordsSynced: number;
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
}

// Webhook types
export interface ShopifyWebhookEvent {
  id: string;
  shopId: string;
  topic: string;
  payload: any;
  processed: boolean;
  processedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

// API response types
export interface ShopifyAPIError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface ShopifyPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface ShopifyConnectionList<T> {
  edges: Array<{
    node: T;
    cursor: string;
  }>;
  pageInfo: ShopifyPageInfo;
}

// OAuth types
export interface ShopifyOAuthState {
  shop: string;
  state: string;
  redirectUrl?: string;
}

export interface ShopifyAccessTokenResponse {
  access_token: string;
  scope: string;
  expires_in?: number;
  associated_user_scope?: string;
  associated_user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    account_owner: boolean;
  };
}

// Webhook verification
export interface ShopifyWebhookHeaders {
  'x-shopify-topic': string;
  'x-shopify-hmac-sha256': string;
  'x-shopify-shop-domain': string;
  'x-shopify-api-version': string;
  'x-shopify-webhook-id': string;
}

// Email block types
export interface ShopifyProductBlock {
  type: 'shopify-product';
  productId: string;
  layout: 'card' | 'horizontal' | 'minimal';
  showPrice: boolean;
  showDescription: boolean;
  showButton: boolean;
  buttonText?: string;
  buttonColor?: string;
}

export interface ShopifyProductGridBlock {
  type: 'shopify-product-grid';
  productIds: string[];
  columns: 2 | 3 | 4;
  showPrice: boolean;
  showTitle: boolean;
  imageAspectRatio: 'square' | 'landscape' | 'portrait';
}

export interface ShopifyAbandonedCartBlock {
  type: 'shopify-abandoned-cart';
  showImage: boolean;
  showPrice: boolean;
  showQuantity: boolean;
  showSubtotal: boolean;
  buttonText?: string;
  buttonColor?: string;
}