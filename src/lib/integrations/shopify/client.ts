/**
 * Enhanced Shopify API Client
 */

import { createAdminApiClient } from '@shopify/admin-api-client';
import { 
  ShopifyProduct, 
  ShopifyCustomer, 
  ShopifyOrder, 
  ShopifyAbandonedCart,
  ShopifyConnection,
  ShopifyPageInfo,
  ShopifyAPIError
} from './types';

export class ShopifyClient {
  private client: any;
  private shop: string;
  private accessToken: string;
  private apiVersion: string = '2024-01';

  constructor(shop: string, accessToken: string) {
    this.shop = shop;
    this.accessToken = accessToken;
    this.client = createAdminApiClient({
      storeDomain: shop,
      apiVersion: this.apiVersion,
      accessToken: accessToken,
    });
  }

  /**
   * Shop Information
   */
  async getShopInfo() {
    const query = `
      query getShop {
        shop {
          id
          name
          email
          contactEmail
          currencyCode
          primaryDomain {
            url
            host
          }
          plan {
            displayName
            partnerDevelopment
            shopifyPlus
          }
          createdAt
          timezoneAbbreviation
          timezoneOffset
        }
      }
    `;

    const response = await this.client.request(query);
    return response.data.shop;
  }

  /**
   * Products
   */
  async getProducts(first: number = 50, after?: string) {
    const query = `
      query getProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          edges {
            node {
              id
              title
              description
              descriptionHtml
              vendor
              productType
              tags
              status
              createdAt
              updatedAt
              images(first: 10) {
                edges {
                  node {
                    id
                    url
                    altText
                    width
                    height
                  }
                }
              }
              variants(first: 100) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    sku
                    barcode
                    inventoryQuantity
                    weight
                    weightUnit
                    image {
                      url
                      altText
                    }
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
              options {
                id
                name
                position
                values
              }
              collections(first: 10) {
                edges {
                  node {
                    id
                    title
                  }
                }
              }
              seo {
                title
                description
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    const response = await this.client.request(query, {
      variables: { first, after }
    });

    return response.data.products;
  }

  async getProductById(id: string) {
    const query = `
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          descriptionHtml
          vendor
          productType
          tags
          status
          createdAt
          updatedAt
          images(first: 10) {
            edges {
              node {
                id
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                price
                compareAtPrice
                sku
                barcode
                inventoryQuantity
                weight
                weightUnit
                image {
                  url
                  altText
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            id
            name
            position
            values
          }
          seo {
            title
            description
          }
        }
      }
    `;

    const response = await this.client.request(query, {
      variables: { id }
    });

    return response.data.product;
  }

  /**
   * Customers
   */
  async getCustomers(first: number = 50, after?: string, query?: string) {
    const graphqlQuery = `
      query getCustomers($first: Int!, $after: String, $query: String) {
        customers(first: $first, after: $after, query: $query) {
          edges {
            node {
              id
              email
              firstName
              lastName
              phone
              tags
              acceptsMarketing
              marketingOptInLevel
              smsMarketingConsent {
                marketingState
                marketingOptInLevel
                consentUpdatedAt
              }
              totalSpent
              ordersCount
              addresses {
                id
                firstName
                lastName
                company
                address1
                address2
                city
                province
                country
                zip
                phone
              }
              defaultAddress {
                id
                firstName
                lastName
                company
                address1
                address2
                city
                province
                country
                zip
                phone
              }
              createdAt
              updatedAt
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    const response = await this.client.request(graphqlQuery, {
      variables: { first, after, query }
    });

    return response.data.customers;
  }

  async getCustomerSegments() {
    // Note: Customer segments are not directly available via GraphQL
    // We'll need to use saved searches or implement custom segmentation
    const query = `
      query getCustomerSavedSearches($first: Int!) {
        customerSavedSearches(first: $first) {
          edges {
            node {
              id
              name
              query
            }
          }
        }
      }
    `;

    const response = await this.client.request(query, {
      variables: { first: 50 }
    });

    return response.data.customerSavedSearches;
  }

  /**
   * Abandoned Carts
   */
  async getAbandonedCheckouts(first: number = 50, after?: string) {
    const query = `
      query getAbandonedCheckouts($first: Int!, $after: String) {
        abandonedCheckouts(first: $first, after: $after) {
          edges {
            node {
              id
              completedAt
              createdAt
              updatedAt
              email
              phone
              totalPrice
              subtotalPrice
              totalTax
              currency
              abandonedCheckoutUrl
              lineItems(first: 50) {
                edges {
                  node {
                    id
                    title
                    variantTitle
                    quantity
                    price
                    linePrice
                    image {
                      url
                      altText
                    }
                    variant {
                      id
                      sku
                      price
                    }
                    product {
                      id
                      vendor
                    }
                  }
                }
              }
              customer {
                id
                email
                firstName
                lastName
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    const response = await this.client.request(query, {
      variables: { first, after }
    });

    return response.data.abandonedCheckouts;
  }

  /**
   * Orders
   */
  async getOrders(first: number = 50, after?: string, query?: string) {
    const graphqlQuery = `
      query getOrders($first: Int!, $after: String, $query: String) {
        orders(first: $first, after: $after, query: $query) {
          edges {
            node {
              id
              name
              email
              createdAt
              processedAt
              financialStatus
              fulfillmentStatus
              subtotalPrice
              totalPrice
              totalTax
              totalDiscounts
              currencyCode
              tags
              note
              lineItems(first: 50) {
                edges {
                  node {
                    id
                    title
                    variantTitle
                    quantity
                    price
                    totalDiscount
                    sku
                    vendor
                    variant {
                      id
                    }
                    product {
                      id
                    }
                    fulfillmentStatus
                  }
                }
              }
              shippingAddress {
                firstName
                lastName
                company
                address1
                address2
                city
                province
                country
                zip
                phone
              }
              billingAddress {
                firstName
                lastName
                company
                address1
                address2
                city
                province
                country
                zip
                phone
              }
              customer {
                id
                email
                firstName
                lastName
              }
              fulfillments {
                trackingNumbers
                trackingUrls
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    const response = await this.client.request(graphqlQuery, {
      variables: { first, after, query }
    });

    return response.data.orders;
  }

  async getOrdersByCustomer(customerId: string, first: number = 10) {
    const query = `
      query getCustomerOrders($customerId: ID!, $first: Int!) {
        customer(id: $customerId) {
          orders(first: $first, sortKey: CREATED_AT, reverse: true) {
            edges {
              node {
                id
                name
                createdAt
                financialStatus
                fulfillmentStatus
                totalPrice
                lineItems(first: 5) {
                  edges {
                    node {
                      title
                      quantity
                      price
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request(query, {
      variables: { customerId, first }
    });

    return response.data.customer?.orders;
  }

  /**
   * Collections
   */
  async getCollections(first: number = 50) {
    const query = `
      query getCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              title
              description
              image {
                url
                altText
              }
              productsCount
            }
          }
        }
      }
    `;

    const response = await this.client.request(query, {
      variables: { first }
    });

    return response.data.collections;
  }

  /**
   * Webhooks
   */
  async createWebhook(topic: string, callbackUrl: string) {
    const mutation = `
      mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
          webhookSubscription {
            id
            topic
            callbackUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await this.client.request(mutation, {
      variables: {
        topic: topic,
        webhookSubscription: {
          callbackUrl: callbackUrl,
          format: 'JSON'
        }
      }
    });

    if (response.data.webhookSubscriptionCreate.userErrors?.length > 0) {
      throw new Error(response.data.webhookSubscriptionCreate.userErrors[0].message);
    }

    return response.data.webhookSubscriptionCreate.webhookSubscription;
  }

  async listWebhooks() {
    const query = `
      query getWebhooks {
        webhookSubscriptions(first: 50) {
          edges {
            node {
              id
              topic
              callbackUrl
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const response = await this.client.request(query);
    return response.data.webhookSubscriptions;
  }

  async deleteWebhook(id: string) {
    const mutation = `
      mutation webhookSubscriptionDelete($id: ID!) {
        webhookSubscriptionDelete(id: $id) {
          deletedWebhookSubscriptionId
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await this.client.request(mutation, {
      variables: { id }
    });

    if (response.data.webhookSubscriptionDelete.userErrors?.length > 0) {
      throw new Error(response.data.webhookSubscriptionDelete.userErrors[0].message);
    }

    return response.data.webhookSubscriptionDelete.deletedWebhookSubscriptionId;
  }

  /**
   * Metafields
   */
  async getProductMetafields(productId: string, namespace?: string) {
    const query = `
      query getProductMetafields($productId: ID!, $namespace: String) {
        product(id: $productId) {
          metafields(first: 50, namespace: $namespace) {
            edges {
              node {
                id
                namespace
                key
                value
                type
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request(query, {
      variables: { productId, namespace }
    });

    return response.data.product?.metafields;
  }
}