import { createAdminApiClient } from '@shopify/admin-api-client';

export class ShopifyIntegration {
  private client: any;
  private shop: string;
  private accessToken: string;

  constructor(shop: string, accessToken: string) {
    this.shop = shop;
    this.accessToken = accessToken;
    this.client = createAdminApiClient({
      storeDomain: shop,
      apiVersion: '2024-01',
      accessToken: accessToken,
    });
  }

  async syncProducts(limit = 50) {
    const query = `
      query getProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              description
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    price
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request(query, {
      variables: { first: limit }
    });

    return response.data.products.edges.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      description: edge.node.description,
      image: edge.node.images.edges[0]?.node.url,
      price: edge.node.variants.edges[0]?.node.price
    }));
  }

  async syncCustomers(limit = 50) {
    const query = `
      query getCustomers($first: Int!) {
        customers(first: $first) {
          edges {
            node {
              id
              email
              firstName
              lastName
              ordersCount
              totalSpent
            }
          }
        }
      }
    `;

    const response = await this.client.request(query, {
      variables: { first: limit }
    });

    return response.data.customers.edges.map((edge: any) => edge.node);
  }

  async getAbandonedCarts() {
    const query = `
      query getAbandonedCheckouts {
        abandonedCheckouts(first: 50) {
          edges {
            node {
              id
              createdAt
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      price
                      image {
                        url
                      }
                    }
                  }
                }
              }
              customer {
                email
                firstName
                lastName
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request(query);
    return response.data.abandonedCheckouts.edges.map((edge: any) => edge.node);
  }

  async createWebhook(topic: string, callbackUrl: string) {
    const mutation = `
      mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
          webhookSubscription {
            id
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

    return response.data.webhookSubscriptionCreate;
  }
}

// OAuth flow helper
export async function exchangeCodeForToken(shop: string, code: string) {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_CLIENT_ID,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();
  return data.access_token;
}