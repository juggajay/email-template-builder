// Import Shopify merge tags
import { shopifyMergeTags } from './merge-tags/shopify';

export const mergeTags = {
  customer: {
    name: 'Customer',
    mergeTags: {
      first_name: {
        name: 'First Name',
        value: '{{customer.first_name}}',
        sample: 'John'
      },
      last_name: {
        name: 'Last Name',
        value: '{{customer.last_name}}',
        sample: 'Doe'
      },
      email: {
        name: 'Email',
        value: '{{customer.email}}',
        sample: 'john.doe@example.com'
      },
      phone: {
        name: 'Phone',
        value: '{{customer.phone}}',
        sample: '+1 (555) 123-4567'
      },
      total_orders: {
        name: 'Total Orders',
        value: '{{customer.total_orders}}',
        sample: '5'
      },
      lifetime_value: {
        name: 'Lifetime Value',
        value: '{{customer.lifetime_value}}',
        sample: '$1,234.56'
      }
    }
  },
  order: {
    name: 'Order',
    mergeTags: {
      number: {
        name: 'Order Number',
        value: '{{order.number}}',
        sample: '#10234'
      },
      total: {
        name: 'Order Total',
        value: '{{order.total}}',
        sample: '$129.99'
      },
      status: {
        name: 'Order Status',
        value: '{{order.status}}',
        sample: 'Shipped'
      },
      tracking_number: {
        name: 'Tracking Number',
        value: '{{order.tracking_number}}',
        sample: '1Z999AA10123456784'
      },
      items: {
        name: 'Order Items',
        value: '{{order.items}}',
        sample: 'Product list will appear here'
      },
      shipping_address: {
        name: 'Shipping Address',
        value: '{{order.shipping_address}}',
        sample: '123 Main St, City, State 12345'
      },
      estimated_delivery: {
        name: 'Estimated Delivery',
        value: '{{order.estimated_delivery}}',
        sample: 'July 25, 2025'
      }
    }
  },
  product: {
    name: 'Product',
    mergeTags: {
      name: {
        name: 'Product Name',
        value: '{{product.name}}',
        sample: 'Premium Wireless Headphones'
      },
      price: {
        name: 'Product Price',
        value: '{{product.price}}',
        sample: '$79.99'
      },
      image: {
        name: 'Product Image',
        value: '{{product.image}}',
        sample: 'Product image URL'
      },
      description: {
        name: 'Product Description',
        value: '{{product.description}}',
        sample: 'High-quality wireless headphones with noise cancellation'
      },
      url: {
        name: 'Product URL',
        value: '{{product.url}}',
        sample: 'https://store.com/product/...'
      },
      sku: {
        name: 'Product SKU',
        value: '{{product.sku}}',
        sample: 'SKU-123456'
      },
      in_stock: {
        name: 'Stock Status',
        value: '{{product.in_stock}}',
        sample: 'In Stock'
      }
    }
  },
  store: {
    name: 'Store',
    mergeTags: {
      name: {
        name: 'Store Name',
        value: '{{store.name}}',
        sample: 'Your Store Name'
      },
      email: {
        name: 'Store Email',
        value: '{{store.email}}',
        sample: 'support@yourstore.com'
      },
      phone: {
        name: 'Store Phone',
        value: '{{store.phone}}',
        sample: '+1 (555) 000-0000'
      },
      address: {
        name: 'Store Address',
        value: '{{store.address}}',
        sample: '456 Commerce Blvd, Business City, BC 54321'
      },
      logo: {
        name: 'Store Logo',
        value: '{{store.logo}}',
        sample: 'Store logo URL'
      },
      website: {
        name: 'Store Website',
        value: '{{store.website}}',
        sample: 'https://yourstore.com'
      },
      support_email: {
        name: 'Support Email',
        value: '{{store.support_email}}',
        sample: 'help@yourstore.com'
      }
    }
  },
  dynamic: {
    name: 'Dynamic Content',
    mergeTags: {
      abandoned_cart_items: {
        name: 'Abandoned Cart Items',
        value: '{{abandoned_cart.items}}',
        sample: 'Cart items will be displayed here'
      },
      abandoned_cart_total: {
        name: 'Abandoned Cart Total',
        value: '{{abandoned_cart.total}}',
        sample: '$199.98'
      },
      abandoned_cart_link: {
        name: 'Cart Recovery Link',
        value: '{{abandoned_cart.link}}',
        sample: 'https://store.com/cart/recover/...'
      },
      recommended_products: {
        name: 'Recommended Products',
        value: '{{recommended_products}}',
        sample: 'Personalized product recommendations'
      },
      discount_code: {
        name: 'Discount Code',
        value: '{{discount_code}}',
        sample: 'SAVE20'
      },
      discount_amount: {
        name: 'Discount Amount',
        value: '{{discount_amount}}',
        sample: '20%'
      },
      discount_expiry: {
        name: 'Discount Expiry',
        value: '{{discount_expiry}}',
        sample: 'July 31, 2025'
      },
      loyalty_points: {
        name: 'Loyalty Points',
        value: '{{loyalty_points}}',
        sample: '1,250 points'
      },
      loyalty_tier: {
        name: 'Loyalty Tier',
        value: '{{loyalty_tier}}',
        sample: 'Gold Member'
      },
      referral_code: {
        name: 'Referral Code',
        value: '{{referral_code}}',
        sample: 'FRIEND20'
      },
      wishlist_items: {
        name: 'Wishlist Items',
        value: '{{wishlist_items}}',
        sample: 'Saved items list'
      }
    }
  },
  date: {
    name: 'Date & Time',
    mergeTags: {
      current_year: {
        name: 'Current Year',
        value: '{{date.current_year}}',
        sample: '2025'
      },
      current_month: {
        name: 'Current Month',
        value: '{{date.current_month}}',
        sample: 'July'
      },
      current_day: {
        name: 'Current Day',
        value: '{{date.current_day}}',
        sample: '18'
      },
      timestamp: {
        name: 'Timestamp',
        value: '{{date.timestamp}}',
        sample: 'July 18, 2025 10:30 AM'
      }
    }
  },
  social: {
    name: 'Social Media',
    mergeTags: {
      unsubscribe_link: {
        name: 'Unsubscribe Link',
        value: '{{unsubscribe_link}}',
        sample: 'https://store.com/unsubscribe/...'
      },
      preferences_link: {
        name: 'Preferences Link',
        value: '{{preferences_link}}',
        sample: 'https://store.com/preferences/...'
      },
      facebook_url: {
        name: 'Facebook URL',
        value: '{{social.facebook}}',
        sample: 'https://facebook.com/yourstore'
      },
      twitter_url: {
        name: 'Twitter URL',
        value: '{{social.twitter}}',
        sample: 'https://twitter.com/yourstore'
      },
      instagram_url: {
        name: 'Instagram URL',
        value: '{{social.instagram}}',
        sample: 'https://instagram.com/yourstore'
      },
      linkedin_url: {
        name: 'LinkedIn URL',
        value: '{{social.linkedin}}',
        sample: 'https://linkedin.com/company/yourstore'
      }
    }
  }
};

// Helper function to get all merge tags in a flat structure
export function getAllMergeTags() {
  const allTags: any[] = [];
  
  // Add standard merge tags
  Object.entries(mergeTags).forEach(([categoryKey, category]) => {
    Object.entries(category.mergeTags).forEach(([tagKey, tag]) => {
      allTags.push({
        category: category.name,
        name: tag.name,
        value: tag.value,
        sample: tag.sample
      });
    });
  });
  
  // Add Shopify merge tags
  Object.entries(shopifyMergeTags).forEach(([categoryKey, category]) => {
    Object.entries(category.mergeTags).forEach(([tagKey, tag]) => {
      allTags.push({
        category: category.name,
        name: tag.name,
        value: tag.value,
        sample: tag.sample
      });
    });
  });
  
  return allTags;
}

// Helper function to get sample data for testing
export function getSampleData() {
  const sampleData: any = {};
  
  // Standard merge tags sample data
  Object.entries(mergeTags).forEach(([categoryKey, category]) => {
    sampleData[categoryKey] = {};
    Object.entries(category.mergeTags).forEach(([tagKey, tag]) => {
      // Extract the key from the merge tag value (e.g., {{customer.first_name}} -> first_name)
      const key = tag.value.match(/\{\{[^.]+\.([^}]+)\}\}/)?.[1] || tagKey;
      sampleData[categoryKey][key] = tag.sample;
    });
  });
  
  // Shopify merge tags sample data
  sampleData.shopify = {
    customer: {
      id: 'gid://shopify/Customer/123456',
      tags: 'VIP, Wholesale',
      orders_count: '12',
      total_spent: '$2,456.78',
      average_order_value: '$204.73',
      accepts_marketing: 'Yes',
      currency: 'USD'
    },
    product: {
      title: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: '$79.99',
      compare_at_price: '$99.99',
      vendor: 'TechBrand',
      type: 'Electronics',
      tags: 'wireless, bluetooth, headphones',
      image_url: 'https://cdn.shopify.com/s/files/1/product.jpg',
      url: 'https://store.com/products/wireless-headphones',
      in_stock: 'Yes',
      inventory_quantity: '45'
    },
    cart: {
      items_count: '3',
      total_price: '$234.56',
      subtotal_price: '$210.00',
      total_tax: '$24.56',
      currency: 'USD',
      abandoned_date: 'July 25, 2025',
      recovery_url: 'https://store.com/cart/recover/abc123',
      items: [
        {
          title: 'Wireless Headphones',
          quantity: '2',
          price: '$79.99',
          line_price: '$159.98',
          image: 'https://cdn.shopify.com/s/files/1/item.jpg'
        }
      ]
    },
    order: {
      number: '#1234',
      id: 'gid://shopify/Order/123456',
      total_price: '$345.67',
      subtotal_price: '$320.00',
      total_tax: '$25.67',
      total_shipping: '$10.00',
      total_discounts: '$15.00',
      financial_status: 'Paid',
      fulfillment_status: 'Fulfilled',
      created_at: 'July 20, 2025',
      tracking_number: '1Z999AA10123456784',
      tracking_url: 'https://track.carrier.com/1Z999AA10123456784'
    },
    shop: {
      name: 'My Awesome Store',
      domain: 'mystore.com',
      email: 'contact@mystore.com',
      currency: 'USD',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, State 12345',
      timezone: 'America/New_York'
    }
  };
  
  return sampleData;
}