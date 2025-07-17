export interface EcommerceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  avgRecoveryRate?: string;
  conversionRate?: string;
  openRate?: string;
  ctrIncrease?: string;
  design: any;
}

export const ECOMMERCE_TEMPLATES: Record<string, EcommerceTemplate> = {
  'abandoned-cart': {
    id: 'abandoned-cart-1',
    name: 'Abandoned Cart Reminder',
    description: 'Recover lost sales with a friendly reminder',
    category: 'abandoned-cart',
    thumbnail: '/templates/abandoned-cart.png',
    avgRecoveryRate: '15%',
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  {
                    type: 'heading',
                    values: {
                      text: 'You left something behind...',
                      headingType: 'h2'
                    }
                  },
                  {
                    type: 'text',
                    values: {
                      text: 'Hi {{customer.first_name}}, looks like you forgot to complete your purchase. Your items are still waiting for you!'
                    }
                  },
                  {
                    type: 'button',
                    values: {
                      text: 'Complete Your Order',
                      href: '{{cart.recovery_url}}',
                      buttonColors: {
                        color: '#ffffff',
                        backgroundColor: '#000000'
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  },
  'welcome-email': {
    id: 'welcome-1',
    name: 'Welcome Series Starter',
    description: 'Make a great first impression',
    category: 'welcome',
    thumbnail: '/templates/welcome.png',
    conversionRate: '25%',
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  {
                    type: 'heading',
                    values: {
                      text: 'Welcome to {{company.name}}!',
                      headingType: 'h1'
                    }
                  },
                  {
                    type: 'text',
                    values: {
                      text: 'Hi {{customer.first_name}}, we\'re thrilled to have you here. As a welcome gift, enjoy 15% off your first order.'
                    }
                  },
                  {
                    type: 'button',
                    values: {
                      text: 'Shop Now with 15% Off',
                      href: '{{shop.url}}?discount=WELCOME15'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  },
  'order-confirmation': {
    id: 'order-confirm-1',
    name: 'Order Confirmation',
    description: 'Professional order confirmation with tracking',
    category: 'order-confirmation',
    thumbnail: '/templates/order-confirm.png',
    openRate: '90%',
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  {
                    type: 'heading',
                    values: {
                      text: 'Order Confirmed! 🎉',
                      headingType: 'h1'
                    }
                  },
                  {
                    type: 'text',
                    values: {
                      text: 'Thank you for your order, {{customer.first_name}}! Order #{{order.number}} is being prepared.'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  },
  'back-in-stock': {
    id: 'back-in-stock-1',
    name: 'Back in Stock Alert',
    description: 'Notify customers when items are available',
    category: 'promotional',
    thumbnail: '/templates/back-in-stock.png',
    conversionRate: '28%',
    design: {}
  },
  'product-recommendation': {
    id: 'product-rec-1',
    name: 'Personalized Recommendations',
    description: 'AI-powered product suggestions',
    category: 'promotional',
    thumbnail: '/templates/recommendations.png',
    ctrIncrease: '100%',
    design: {}
  }
};