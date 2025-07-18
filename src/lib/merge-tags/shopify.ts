/**
 * Shopify-specific merge tags
 */

export const shopifyMergeTags = {
  shopify_customer: {
    name: 'Shopify Customer',
    mergeTags: {
      id: {
        name: 'Customer ID',
        value: '{{shopify.customer.id}}',
        sample: 'gid://shopify/Customer/123456'
      },
      tags: {
        name: 'Customer Tags',
        value: '{{shopify.customer.tags}}',
        sample: 'VIP, Wholesale'
      },
      orders_count: {
        name: 'Total Orders',
        value: '{{shopify.customer.orders_count}}',
        sample: '12'
      },
      total_spent: {
        name: 'Total Spent',
        value: '{{shopify.customer.total_spent}}',
        sample: '$2,456.78'
      },
      average_order_value: {
        name: 'Average Order Value',
        value: '{{shopify.customer.average_order_value}}',
        sample: '$204.73'
      },
      accepts_marketing: {
        name: 'Accepts Marketing',
        value: '{{shopify.customer.accepts_marketing}}',
        sample: 'Yes'
      },
      currency: {
        name: 'Currency',
        value: '{{shopify.customer.currency}}',
        sample: 'USD'
      }
    }
  },
  shopify_product: {
    name: 'Shopify Product',
    mergeTags: {
      title: {
        name: 'Product Title',
        value: '{{shopify.product.title}}',
        sample: 'Premium Wireless Headphones'
      },
      description: {
        name: 'Product Description',
        value: '{{shopify.product.description}}',
        sample: 'High-quality wireless headphones with noise cancellation'
      },
      price: {
        name: 'Product Price',
        value: '{{shopify.product.price}}',
        sample: '$79.99'
      },
      compare_at_price: {
        name: 'Compare at Price',
        value: '{{shopify.product.compare_at_price}}',
        sample: '$99.99'
      },
      vendor: {
        name: 'Product Vendor',
        value: '{{shopify.product.vendor}}',
        sample: 'TechBrand'
      },
      type: {
        name: 'Product Type',
        value: '{{shopify.product.type}}',
        sample: 'Electronics'
      },
      tags: {
        name: 'Product Tags',
        value: '{{shopify.product.tags}}',
        sample: 'wireless, bluetooth, headphones'
      },
      image_url: {
        name: 'Product Image URL',
        value: '{{shopify.product.image_url}}',
        sample: 'https://cdn.shopify.com/s/files/1/product.jpg'
      },
      url: {
        name: 'Product URL',
        value: '{{shopify.product.url}}',
        sample: 'https://store.com/products/wireless-headphones'
      },
      in_stock: {
        name: 'In Stock',
        value: '{{shopify.product.in_stock}}',
        sample: 'Yes'
      },
      inventory_quantity: {
        name: 'Inventory Quantity',
        value: '{{shopify.product.inventory_quantity}}',
        sample: '45'
      }
    }
  },
  shopify_cart: {
    name: 'Shopify Cart',
    mergeTags: {
      items_count: {
        name: 'Cart Items Count',
        value: '{{shopify.cart.items_count}}',
        sample: '3'
      },
      total_price: {
        name: 'Cart Total',
        value: '{{shopify.cart.total_price}}',
        sample: '$234.56'
      },
      subtotal_price: {
        name: 'Cart Subtotal',
        value: '{{shopify.cart.subtotal_price}}',
        sample: '$210.00'
      },
      total_tax: {
        name: 'Cart Tax',
        value: '{{shopify.cart.total_tax}}',
        sample: '$24.56'
      },
      currency: {
        name: 'Cart Currency',
        value: '{{shopify.cart.currency}}',
        sample: 'USD'
      },
      abandoned_date: {
        name: 'Abandoned Date',
        value: '{{shopify.cart.abandoned_date}}',
        sample: 'July 25, 2025'
      },
      recovery_url: {
        name: 'Cart Recovery URL',
        value: '{{shopify.cart.recovery_url}}',
        sample: 'https://store.com/cart/recover/abc123'
      },
      items: {
        name: 'Cart Items (Loop)',
        value: '{{#shopify.cart.items}}...{{/shopify.cart.items}}',
        sample: 'Use in loops to display cart items'
      }
    }
  },
  shopify_order: {
    name: 'Shopify Order',
    mergeTags: {
      number: {
        name: 'Order Number',
        value: '{{shopify.order.number}}',
        sample: '#1234'
      },
      id: {
        name: 'Order ID',
        value: '{{shopify.order.id}}',
        sample: 'gid://shopify/Order/123456'
      },
      total_price: {
        name: 'Order Total',
        value: '{{shopify.order.total_price}}',
        sample: '$345.67'
      },
      subtotal_price: {
        name: 'Order Subtotal',
        value: '{{shopify.order.subtotal_price}}',
        sample: '$320.00'
      },
      total_tax: {
        name: 'Order Tax',
        value: '{{shopify.order.total_tax}}',
        sample: '$25.67'
      },
      total_shipping: {
        name: 'Shipping Cost',
        value: '{{shopify.order.total_shipping}}',
        sample: '$10.00'
      },
      total_discounts: {
        name: 'Total Discounts',
        value: '{{shopify.order.total_discounts}}',
        sample: '$15.00'
      },
      financial_status: {
        name: 'Payment Status',
        value: '{{shopify.order.financial_status}}',
        sample: 'Paid'
      },
      fulfillment_status: {
        name: 'Fulfillment Status',
        value: '{{shopify.order.fulfillment_status}}',
        sample: 'Fulfilled'
      },
      created_at: {
        name: 'Order Date',
        value: '{{shopify.order.created_at}}',
        sample: 'July 20, 2025'
      },
      tracking_number: {
        name: 'Tracking Number',
        value: '{{shopify.order.tracking_number}}',
        sample: '1Z999AA10123456784'
      },
      tracking_url: {
        name: 'Tracking URL',
        value: '{{shopify.order.tracking_url}}',
        sample: 'https://track.carrier.com/1Z999AA10123456784'
      },
      items: {
        name: 'Order Items (Loop)',
        value: '{{#shopify.order.items}}...{{/shopify.order.items}}',
        sample: 'Use in loops to display order items'
      }
    }
  },
  shopify_shop: {
    name: 'Shopify Shop',
    mergeTags: {
      name: {
        name: 'Shop Name',
        value: '{{shopify.shop.name}}',
        sample: 'My Awesome Store'
      },
      domain: {
        name: 'Shop Domain',
        value: '{{shopify.shop.domain}}',
        sample: 'mystore.com'
      },
      email: {
        name: 'Shop Email',
        value: '{{shopify.shop.email}}',
        sample: 'contact@mystore.com'
      },
      currency: {
        name: 'Shop Currency',
        value: '{{shopify.shop.currency}}',
        sample: 'USD'
      },
      phone: {
        name: 'Shop Phone',
        value: '{{shopify.shop.phone}}',
        sample: '+1 (555) 123-4567'
      },
      address: {
        name: 'Shop Address',
        value: '{{shopify.shop.address}}',
        sample: '123 Main St, City, State 12345'
      },
      timezone: {
        name: 'Shop Timezone',
        value: '{{shopify.shop.timezone}}',
        sample: 'America/New_York'
      }
    }
  },
  shopify_loops: {
    name: 'Shopify Loops',
    mergeTags: {
      cart_item_title: {
        name: 'Cart Item Title',
        value: '{{title}}',
        sample: 'Wireless Headphones (within cart items loop)'
      },
      cart_item_quantity: {
        name: 'Cart Item Quantity',
        value: '{{quantity}}',
        sample: '2 (within cart items loop)'
      },
      cart_item_price: {
        name: 'Cart Item Price',
        value: '{{price}}',
        sample: '$79.99 (within cart items loop)'
      },
      cart_item_total: {
        name: 'Cart Item Total',
        value: '{{line_price}}',
        sample: '$159.98 (within cart items loop)'
      },
      cart_item_image: {
        name: 'Cart Item Image',
        value: '{{image}}',
        sample: 'https://cdn.shopify.com/s/files/1/item.jpg'
      },
      order_item_title: {
        name: 'Order Item Title',
        value: '{{title}}',
        sample: 'Product Name (within order items loop)'
      },
      order_item_quantity: {
        name: 'Order Item Quantity',
        value: '{{quantity}}',
        sample: '1 (within order items loop)'
      },
      order_item_price: {
        name: 'Order Item Price',
        value: '{{price}}',
        sample: '$99.99 (within order items loop)'
      }
    }
  }
};

// Helper function to get all Shopify merge tags in flat structure
export function getShopifyMergeTags() {
  const allTags: Record<string, any> = {};
  
  Object.entries(shopifyMergeTags).forEach(([categoryKey, category]) => {
    Object.entries(category.mergeTags).forEach(([tagKey, tag]) => {
      const fullKey = `shopify_${categoryKey}_${tagKey}`;
      allTags[fullKey] = {
        ...tag,
        category: category.name
      };
    });
  });
  
  return allTags;
}

// Helper function to check if a merge tag is a Shopify tag
export function isShopifyMergeTag(tag: string): boolean {
  return tag.startsWith('{{shopify.') || tag.startsWith('{{#shopify.');
}