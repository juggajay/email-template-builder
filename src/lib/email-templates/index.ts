import type { EmailTemplate } from '@/types';
import { getBase64Placeholder } from '@/lib/utils/image-fallback';

export interface SeedTemplate {
  name: string;
  description: string;
  category: EmailTemplate['category'];
  tags: string[];
  is_premium: boolean;
  rating: number;
  usage_count: number;
  design: any; // Unlayer design JSON
  thumbnail?: string;
}

// Base template design structures for reusability
const baseDesignElements = {
  header: (content: string, fontSize = '24px') => ({
    type: 'text',
    values: {
      containerPadding: '10px',
      fontSize,
      textAlign: 'center',
      lineHeight: '140%',
      text: content,
      linkStyle: {
        inherit: true,
        linkColor: '#0000ee',
        linkHoverColor: '#0000ee',
        linkUnderline: true,
        linkHoverUnderline: true
      },
      selectable: true,
      draggable: true,
      duplicatable: true,
      deletable: true,
      hideable: true
    }
  }),
  
  image: (alt: string, width = 600, height = 400) => ({
    type: 'image',
    values: {
      containerPadding: '10px',
      src: {
        url: getBase64Placeholder(width, height, alt),
        width,
        height
      },
      textAlign: 'center',
      altText: alt,
      action: {
        name: 'web',
        values: {
          href: '',
          target: '_blank'
        }
      },
      selectable: true,
      draggable: true,
      duplicatable: true,
      deletable: true,
      hideable: true
    }
  }),
  
  button: (text: string, href = '#') => ({
    type: 'button',
    values: {
      containerPadding: '10px',
      anchor: '',
      href,
      target: '_blank',
      buttonColors: {
        color: '#ffffff',
        backgroundColor: '#2563eb',
        hoverColor: '#ffffff',
        hoverBackgroundColor: '#1d4ed8'
      },
      size: {
        autoWidth: true,
        width: '100%'
      },
      fontSize: '16px',
      fontWeight: 700,
      lineHeight: '120%',
      linkStyle: {
        inherit: true,
        linkColor: '#0000ee',
        linkHoverColor: '#0000ee',
        linkUnderline: true,
        linkHoverUnderline: true
      },
      borderRadius: '4px',
      padding: '12px 24px',
      text,
      selectable: true,
      draggable: true,
      duplicatable: true,
      deletable: true,
      hideable: true
    }
  }),
  
  text: (content: string, fontSize = '16px') => ({
    type: 'text',
    values: {
      containerPadding: '10px',
      fontSize,
      textAlign: 'left',
      lineHeight: '140%',
      text: content,
      linkStyle: {
        inherit: true,
        linkColor: '#0000ee',
        linkHoverColor: '#0000ee',
        linkUnderline: true,
        linkHoverUnderline: true
      },
      selectable: true,
      draggable: true,
      duplicatable: true,
      deletable: true,
      hideable: true
    }
  }),
  
  divider: () => ({
    type: 'divider',
    values: {
      containerPadding: '10px',
      selectable: true,
      draggable: true,
      duplicatable: true,
      deletable: true,
      hideable: true,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#e5e7eb',
      textAlign: 'center'
    }
  })
};

// Helper to create a row with columns
const createRow = (contents: any[]) => ({
  cells: [1],
  columns: [{
    contents
  }]
});

export const seedTemplates: SeedTemplate[] = [
  // Abandoned Cart Templates
  {
    name: 'Abandoned Cart Reminder',
    description: 'Recover lost sales with this effective cart abandonment email',
    category: 'abandoned-cart',
    tags: ['ecommerce', 'recovery', 'sales'],
    is_premium: false,
    rating: 4.8,
    usage_count: 1250,
    design: {
      body: {
        rows: [
          createRow([baseDesignElements.header('<p><strong>You left something behind!</strong></p>')]),
          createRow([baseDesignElements.image('Product Image')]),
          createRow([baseDesignElements.text('<p>Hey there! We noticed you left some items in your cart. Don\'t worry - we\'ve saved them for you!</p>')]),
          createRow([baseDesignElements.button('Complete Your Purchase')]),
          createRow([baseDesignElements.text('<p>Need help? Reply to this email and we\'ll assist you right away.</p>', '14px')])
        ]
      }
    }
  },
  {
    name: 'Cart Recovery with Discount',
    description: 'Abandoned cart email with a special discount offer',
    category: 'abandoned-cart',
    tags: ['ecommerce', 'discount', 'recovery'],
    is_premium: true,
    rating: 4.9,
    usage_count: 850,
    design: {
      body: {
        rows: [
          createRow([baseDesignElements.header('<p><strong>Wait! Here\'s 10% OFF your cart</strong></p>')]),
          createRow([baseDesignElements.text('<p style="text-align: center; font-size: 20px; color: #dc2626;">Use code: <strong>SAVE10</strong></p>')]),
          createRow([baseDesignElements.image('Cart Items')]),
          createRow([baseDesignElements.button('Claim Your Discount')]),
          createRow([baseDesignElements.text('<p style="text-align: center;">Offer expires in 24 hours!</p>', '14px')])
        ]
      }
    }
  },
  
  // Welcome Templates
  {
    name: 'Welcome Series',
    description: 'Make a great first impression with new subscribers',
    category: 'welcome',
    tags: ['onboarding', 'welcome', 'engagement'],
    is_premium: false,
    rating: 4.9,
    usage_count: 980,
    design: {
      body: {
        rows: [
          createRow([baseDesignElements.header('<p><strong>Welcome to the Family! 🎉</strong></p>', '28px')]),
          createRow([baseDesignElements.text('<p>We\'re thrilled to have you join our community of over 50,000 members!</p>')]),
          createRow([baseDesignElements.image('Welcome Banner', 600, 300)]),
          createRow([baseDesignElements.text('<p><strong>Here\'s what you can expect:</strong></p>')]),
          createRow([baseDesignElements.text('<ul><li>Weekly tips and insights</li><li>Exclusive member discounts</li><li>Early access to new features</li><li>24/7 customer support</li></ul>')]),
          createRow([baseDesignElements.button('Get Started')]),
          createRow([baseDesignElements.divider()]),
          createRow([baseDesignElements.text('<p style="text-align: center;">Questions? Just reply to this email!</p>', '14px')])
        ]
      }
    }
  },
  {
    name: 'Welcome with Onboarding Steps',
    description: 'Guide new users through your platform with clear steps',
    category: 'welcome',
    tags: ['onboarding', 'tutorial', 'guide'],
    is_premium: true,
    rating: 4.7,
    usage_count: 620,
    design: {
      body: {
        rows: [
          createRow([baseDesignElements.header('<p><strong>Welcome! Let\'s Get You Started</strong></p>')]),
          createRow([baseDesignElements.text('<p>Follow these 3 simple steps to make the most of your account:</p>')]),
          createRow([baseDesignElements.text('<p><strong>Step 1: Complete Your Profile</strong><br>Add your details to personalize your experience</p>')]),
          createRow([baseDesignElements.button('Complete Profile')]),
          createRow([baseDesignElements.text('<p><strong>Step 2: Connect Your Tools</strong><br>Integrate with your favorite apps</p>')]),
          createRow([baseDesignElements.button('Browse Integrations')]),
          createRow([baseDesignElements.text('<p><strong>Step 3: Create Your First Project</strong><br>Start building something amazing</p>')]),
          createRow([baseDesignElements.button('Create Project')])
        ]
      }
    }
  },
  
  // Order Confirmation Templates
  {
    name: 'Order Confirmation',
    description: 'Professional order confirmation with tracking info',
    category: 'order-confirmation',
    tags: ['transactional', 'order', 'confirmation'],
    is_premium: false,
    rating: 4.7,
    usage_count: 2100,
    design: {
      body: {
        rows: [
          createRow([baseDesignElements.header('<p><strong>Order Confirmed! ✓</strong></p>')]),
          createRow([baseDesignElements.text('<p style="text-align: center;">Order #12345</p>', '18px')]),
          createRow([baseDesignElements.divider()]),
          createRow([baseDesignElements.text('<p><strong>Shipping Details:</strong></p>')]),
          createRow([baseDesignElements.text('<p>John Doe<br>123 Main Street<br>New York, NY 10001</p>')]),
          createRow([baseDesignElements.text('<p><strong>Order Summary:</strong></p>')]),
          createRow([baseDesignElements.text('<p>Product Name x 1 - $99.99<br>Shipping - $9.99<br><strong>Total: $109.98</strong></p>')]),
          createRow([baseDesignElements.button('Track Your Order')]),
          createRow([baseDesignElements.text('<p style="text-align: center;">Expected delivery: 3-5 business days</p>', '14px')])
        ]
      }
    }
  },
  {
    name: 'Order Shipped Notification',
    description: 'Notify customers when their order has been shipped',
    category: 'order-confirmation',
    tags: ['shipping', 'tracking', 'notification'],
    is_premium: false,
    rating: 4.6,
    usage_count: 1850,
    design: {
      body: {
        rows: [
          createRow([baseDesignElements.header('<p><strong>Your Order is On Its Way! 📦</strong></p>')]),
          createRow([baseDesignElements.image('Package Icon', 200, 200)]),
          createRow([baseDesignElements.text('<p style="text-align: center;">Great news! Your order has been shipped.</p>')]),
          createRow([baseDesignElements.text('<p><strong>Tracking Number:</strong> 1Z999AA10123456784</p>')]),
          createRow([baseDesignElements.button('Track Package')]),
          createRow([baseDesignElements.text('<p>You can also track your package by copying the tracking number above and visiting our carrier\'s website.</p>', '14px')])
        ]
      }
    }
  },
  
  // Product Launch Templates
  {
    name: 'Product Launch Announcement',
    description: 'Generate buzz for your new product launch',
    category: 'product-launch',
    tags: ['launch', 'product', 'announcement'],
    is_premium: true,
    rating: 4.6,
    usage_count: 650,
    design: {
      body: {
        rows: [
          createRow([baseDesignElements.header('<p><strong>Introducing Our Latest Innovation</strong></p>', '32px')]),
          createRow([baseDesignElements.image('Product Hero Image', 800, 400)]),
          createRow([baseDesignElements.text('<p style="text-align: center; font-size: 20px;">The future is here. Meet the all-new Product X.</p>')]),
          createRow([baseDesignElements.text('<p>After months of development and testing, we\'re excited to finally share our latest creation with you. Product X represents a breakthrough in design and functionality.</p>')]),
          createRow([baseDesignElements.button('Shop Now')]),
          createRow([baseDesignElements.text('<p style="text-align: center;"><strong>Limited quantities available</strong></p>')]),
          createRow([baseDesignElements.text('<p style="text-align: center;">Be among the first to experience the difference.</p>', '14px')])
        ]
      }
    }
  },
  {
    name: 'Pre-Launch Teaser',
    description: 'Build anticipation before your product launch',
    category: 'product-launch',
    tags: ['teaser', 'coming-soon', 'launch'],
    is_premium: true,
    rating: 4.5,
    usage_count: 420,
    design: {
      body: {
        rows: [
          createRow([baseDesignElements.header('<p><strong>Something Big is Coming...</strong></p>')]),
          createRow([baseDesignElements.text('<p style="text-align: center; font-size: 48px;">🚀</p>')]),
          createRow([baseDesignElements.text('<p style="text-align: center;">Mark your calendar: Launch Day is March 15th</p>', '18px')]),
          createRow([baseDesignElements.button('Join the Waitlist')]),
          createRow([baseDesignElements.text('<p style="text-align: center;">Be the first to know when we launch + get exclusive early access!</p>', '14px')])
        ]
      }
    }
  },
  
  // Promotional Templates
  {
    name: 'Flash Sale Alert',
    description: 'Drive urgency with limited-time offers',
    category: 'promotional',
    tags: ['sale', 'promotion', 'discount'],
    is_premium: false,
    rating: 4.8,
    usage_count: 1800,
    design: {
      body: {
        rows: [
          createRow([baseDesignElements.header('<p style="color: #dc2626;"><strong>⚡ FLASH SALE - 24 HOURS ONLY ⚡</strong></p>')]),
          createRow([baseDesignElements.text('<p style="text-align: center; font-size: 36px; color: #dc2626;"><strong>50% OFF EVERYTHING</strong></p>')]),
          createRow([baseDesignElements.image('Sale Banner', 600, 300)]),
          createRow([baseDesignElements.text('<p style="text-align: center;">No code needed - discount applied at checkout!</p>')]),
          createRow([baseDesignElements.button('Shop the Sale')]),
          createRow([baseDesignElements.text('<p style="text-align: center; color: #dc2626;">Sale ends at midnight tonight!</p>', '14px')])
        ]
      }
    }
  },
  {
    name: 'Seasonal Promotion',
    description: 'Celebrate the season with special offers',
    category: 'promotional',
    tags: ['seasonal', 'holiday', 'sale'],
    is_premium: false,
    rating: 4.7,
    usage_count: 1420,
    design: {
      body: {
        rows: [
          createRow([baseDesignElements.header('<p><strong>Summer Sale is Here! ☀️</strong></p>', '28px')]),
          createRow([baseDesignElements.text('<p style="text-align: center;">Save up to 40% on summer essentials</p>', '18px')]),
          createRow([baseDesignElements.image('Summer Products', 600, 400)]),
          createRow([baseDesignElements.text('<p>Get ready for summer with our biggest sale of the season! From beachwear to outdoor gear, everything you need is on sale now.</p>')]),
          createRow([baseDesignElements.button('Shop Summer Sale')]),
          createRow([baseDesignElements.divider()]),
          createRow([baseDesignElements.text('<p style="text-align: center;">Plus, free shipping on orders over $50!</p>', '14px')])
        ]
      }
    }
  },
  {
    name: 'VIP Exclusive Offer',
    description: 'Make your best customers feel special with exclusive deals',
    category: 'promotional',
    tags: ['vip', 'exclusive', 'loyalty'],
    is_premium: true,
    rating: 4.9,
    usage_count: 580,
    design: {
      body: {
        rows: [
          createRow([baseDesignElements.header('<p><strong>VIP Access: Just for You</strong></p>')]),
          createRow([baseDesignElements.text('<p style="text-align: center; color: #7c3aed;">As a valued VIP member, you get first access to our private sale</p>')]),
          createRow([baseDesignElements.text('<p style="text-align: center; font-size: 24px;"><strong>30% OFF</strong> + Free Gift</p>')]),
          createRow([baseDesignElements.text('<p>This exclusive offer is our way of saying thank you for being one of our most loyal customers. Shop before the sale goes public!</p>')]),
          createRow([baseDesignElements.button('Shop VIP Sale')]),
          createRow([baseDesignElements.text('<p style="text-align: center;">VIP early access ends in 48 hours</p>', '14px')])
        ]
      }
    }
  },
  {
    name: 'Premium Abandoned Cart Recovery',
    description: 'High-converting abandoned cart email with 20%+ recovery rate. Features urgency, social proof, and personalization.',
    category: 'abandoned-cart',
    tags: ['abandoned-cart', 'high-converting', 'discount', 'urgency', 'personalization', 'social-proof'],
    is_premium: false,
    rating: 5.0,
    usage_count: 0,
    design: {
      "counters": {
        "u_row": 12,
        "u_column": 15,
        "u_content_text": 16,
        "u_content_button": 4,
        "u_content_image": 5,
        "u_content_divider": 3,
        "u_content_html": 3
      },
      "body": {
        "id": "Kc7FgJvRX2",
        "rows": [
          {
            "id": "header-row",
            "cells": [1],
            "columns": [
              {
                "id": "header-col",
                "contents": [
                  {
                    "id": "logo-content",
                    "type": "image",
                    "values": {
                      "src": {
                        "url": "https://via.placeholder.com/180x60/111827/ffffff?text=YOUR+LOGO",
                        "width": 180,
                        "height": 60
                      },
                      "textAlign": "center",
                      "altText": "{{store.name}}",
                      "action": {
                        "name": "web",
                        "values": {
                          "href": "{{store.website}}",
                          "target": "_blank"
                        }
                      }
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#ffffff",
                  "padding": "20px",
                  "_meta": {
                    "htmlID": "u_column_header",
                    "htmlClassNames": "u_column"
                  }
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff",
              "padding": "0px",
              "columnsBackgroundColor": "#ffffff",
              "_meta": {
                "htmlID": "u_row_header",
                "htmlClassNames": "u_row"
              }
            }
          },
          {
            "id": "hero-row",
            "cells": [1],
            "columns": [
              {
                "id": "hero-col",
                "contents": [
                  {
                    "id": "hero-text",
                    "type": "text",
                    "values": {
                      "text": "<h1 style='margin: 0; color: #111827; font-size: 32px; font-weight: 700; text-align: center; line-height: 120%;'>{{customer.first_name|Hi}}, you're so close!</h1>",
                      "hideDesktop": false,
                      "hideMobile": false,
                      "_meta": {
                        "htmlID": "u_content_text_hero",
                        "htmlClassNames": "u_content_text"
                      }
                    }
                  },
                  {
                    "id": "subheading-text",
                    "type": "text",
                    "values": {
                      "text": "<p style='margin: 0; color: #6b7280; font-size: 18px; text-align: center; line-height: 140%; padding-top: 10px;'>Your items are waiting for you. Complete your order in the next 24 hours and get <strong style='color: #059669;'>20% OFF</strong></p>",
                      "hideDesktop": false,
                      "hideMobile": false,
                      "_meta": {
                        "htmlID": "u_content_text_sub",
                        "htmlClassNames": "u_content_text"
                      }
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#f9fafb",
                  "padding": "40px 20px",
                  "_meta": {
                    "htmlID": "u_column_hero",
                    "htmlClassNames": "u_column"
                  }
                }
              }
            ],
            "values": {
              "backgroundColor": "#f9fafb",
              "padding": "0px",
              "_meta": {
                "htmlID": "u_row_hero",
                "htmlClassNames": "u_row"
              }
            }
          },
          {
            "id": "discount-row",
            "cells": [1],
            "columns": [
              {
                "id": "discount-col",
                "contents": [
                  {
                    "id": "discount-html",
                    "type": "html",
                    "values": {
                      "html": "<div style='background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 0 20px;'>\n  <p style='margin: 0; color: #ffffff; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;'>Limited Time Offer</p>\n  <p style='margin: 10px 0 0 0; color: #ffffff; font-size: 48px; font-weight: 700;'>20% OFF</p>\n  <p style='margin: 5px 0 0 0; color: #ffffff; font-size: 20px;'>Use code: <span style='background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 6px; font-weight: 600;'>{{discount_code|SAVE20}}</span></p>\n  <p style='margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;'>⏰ Expires in 24 hours</p>\n</div>",
                      "hideDesktop": false,
                      "hideMobile": false,
                      "_meta": {
                        "htmlID": "u_content_html_discount",
                        "htmlClassNames": "u_content_html"
                      }
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#ffffff",
                  "padding": "20px 0",
                  "_meta": {
                    "htmlID": "u_column_discount",
                    "htmlClassNames": "u_column"
                  }
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff",
              "padding": "0px",
              "_meta": {
                "htmlID": "u_row_discount",
                "htmlClassNames": "u_row"
              }
            }
          },
          {
            "id": "cart-header-row",
            "cells": [1],
            "columns": [
              {
                "id": "cart-header-col",
                "contents": [
                  {
                    "id": "cart-header-text",
                    "type": "text",
                    "values": {
                      "text": "<h2 style='margin: 0; color: #111827; font-size: 24px; font-weight: 600; text-align: center;'>Your Cart ({{abandoned_cart.items|3}} items)</h2>",
                      "hideDesktop": false,
                      "hideMobile": false,
                      "_meta": {
                        "htmlID": "u_content_text_cart_header",
                        "htmlClassNames": "u_content_text"
                      }
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#ffffff",
                  "padding": "30px 20px 20px 20px",
                  "_meta": {
                    "htmlID": "u_column_cart_header",
                    "htmlClassNames": "u_column"
                  }
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff",
              "padding": "0px",
              "_meta": {
                "htmlID": "u_row_cart_header",
                "htmlClassNames": "u_row"
              }
            }
          },
          {
            "id": "product-row-1",
            "cells": [1, 3],
            "columns": [
              {
                "id": "product-image-col",
                "contents": [
                  {
                    "id": "product-image",
                    "type": "image",
                    "values": {
                      "src": {
                        "url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
                        "width": 200,
                        "height": 200
                      },
                      "textAlign": "center",
                      "altText": "{{product.name}}",
                      "borderRadius": "8px",
                      "action": {
                        "name": "web",
                        "values": {
                          "href": "{{product.url}}",
                          "target": "_blank"
                        }
                      }
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#f9fafb",
                  "padding": "20px",
                  "borderRadius": "8px 0 0 8px",
                  "_meta": {
                    "htmlID": "u_column_product_image",
                    "htmlClassNames": "u_column"
                  }
                }
              },
              {
                "id": "product-details-col",
                "contents": [
                  {
                    "id": "product-details",
                    "type": "text",
                    "values": {
                      "text": "<h3 style='margin: 0; color: #111827; font-size: 20px; font-weight: 600;'>{{product.name|Premium Wireless Headphones}}</h3>\n<p style='margin: 10px 0 0 0; color: #6b7280; font-size: 14px;'>Color: Midnight Black | Size: One Size</p>\n<div style='margin: 15px 0;'>\n  <span style='color: #ef4444; font-size: 16px; text-decoration: line-through; margin-right: 10px;'>{{product.original_price|$149.99}}</span>\n  <span style='color: #059669; font-size: 24px; font-weight: 700;'>{{product.sale_price|$119.99}}</span>\n  <span style='background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-left: 10px;'>Save $30</span>\n</div>\n<p style='margin: 10px 0 0 0; color: #6b7280; font-size: 14px;'>Quantity: 1</p>",
                      "hideDesktop": false,
                      "hideMobile": false,
                      "_meta": {
                        "htmlID": "u_content_text_product_details",
                        "htmlClassNames": "u_content_text"
                      }
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#f9fafb",
                  "padding": "20px",
                  "borderRadius": "0 8px 8px 0",
                  "_meta": {
                    "htmlID": "u_column_product_details",
                    "htmlClassNames": "u_column"
                  }
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff",
              "padding": "0px 20px",
              "_meta": {
                "htmlID": "u_row_product_1",
                "htmlClassNames": "u_row"
              }
            }
          },
          {
            "id": "social-proof-row",
            "cells": [1],
            "columns": [
              {
                "id": "social-proof-col",
                "contents": [
                  {
                    "id": "social-proof-html",
                    "type": "html",
                    "values": {
                      "html": "<div style='background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 20px 0 20px; text-align: center;'>\n  <div style='display: inline-block; margin-right: 20px;'>\n    <span style='color: #f59e0b; font-size: 18px;'>★★★★★</span>\n    <p style='margin: 5px 0 0 0; color: #6b7280; font-size: 14px;'>4.8/5 Rating</p>\n  </div>\n  <div style='display: inline-block; margin-right: 20px;'>\n    <p style='margin: 0; color: #111827; font-size: 18px; font-weight: 600;'>2,847</p>\n    <p style='margin: 5px 0 0 0; color: #6b7280; font-size: 14px;'>Happy Customers</p>\n  </div>\n  <div style='display: inline-block;'>\n    <p style='margin: 0; color: #111827; font-size: 18px; font-weight: 600;'>Only 3 left!</p>\n    <p style='margin: 5px 0 0 0; color: #ef4444; font-size: 14px;'>In high demand</p>\n  </div>\n</div>",
                      "hideDesktop": false,
                      "hideMobile": false,
                      "_meta": {
                        "htmlID": "u_content_html_social_proof",
                        "htmlClassNames": "u_content_html"
                      }
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#ffffff",
                  "padding": "0px",
                  "_meta": {
                    "htmlID": "u_column_social_proof",
                    "htmlClassNames": "u_column"
                  }
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff",
              "padding": "0px",
              "_meta": {
                "htmlID": "u_row_social_proof",
                "htmlClassNames": "u_row"
              }
            }
          },
          {
            "id": "divider-row-1",
            "cells": [1],
            "columns": [
              {
                "id": "divider-col-1",
                "contents": [
                  {
                    "id": "divider-1",
                    "type": "divider",
                    "values": {
                      "width": "100%",
                      "border": {
                        "borderTopWidth": "1px",
                        "borderTopStyle": "solid",
                        "borderTopColor": "#e5e7eb"
                      },
                      "textAlign": "center"
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#ffffff",
                  "padding": "20px",
                  "_meta": {
                    "htmlID": "u_column_divider_1",
                    "htmlClassNames": "u_column"
                  }
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff",
              "padding": "0px",
              "_meta": {
                "htmlID": "u_row_divider_1",
                "htmlClassNames": "u_row"
              }
            }
          },
          {
            "id": "totals-row",
            "cells": [1],
            "columns": [
              {
                "id": "totals-col",
                "contents": [
                  {
                    "id": "totals-text",
                    "type": "text",
                    "values": {
                      "text": "<div style='max-width: 400px; margin: 0 auto;'>\n  <div style='display: flex; justify-content: space-between; margin-bottom: 10px;'>\n    <span style='color: #6b7280; font-size: 16px;'>Subtotal:</span>\n    <span style='color: #111827; font-size: 16px; font-weight: 500;'>{{abandoned_cart.subtotal|$359.97}}</span>\n  </div>\n  <div style='display: flex; justify-content: space-between; margin-bottom: 10px;'>\n    <span style='color: #6b7280; font-size: 16px;'>Shipping:</span>\n    <span style='color: #059669; font-size: 16px; font-weight: 500;'>FREE</span>\n  </div>\n  <div style='display: flex; justify-content: space-between; margin-bottom: 15px;'>\n    <span style='color: #059669; font-size: 16px;'>Discount (20%):</span>\n    <span style='color: #059669; font-size: 16px; font-weight: 500;'>-{{discount_amount|$72.00}}</span>\n  </div>\n  <div style='border-top: 2px solid #111827; padding-top: 15px; display: flex; justify-content: space-between;'>\n    <span style='color: #111827; font-size: 20px; font-weight: 700;'>Total:</span>\n    <span style='color: #111827; font-size: 24px; font-weight: 700;'>{{abandoned_cart.total|$287.97}}</span>\n  </div>\n</div>",
                      "hideDesktop": false,
                      "hideMobile": false,
                      "_meta": {
                        "htmlID": "u_content_text_totals",
                        "htmlClassNames": "u_content_text"
                      }
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#ffffff",
                  "padding": "0px 20px 30px 20px",
                  "_meta": {
                    "htmlID": "u_column_totals",
                    "htmlClassNames": "u_column"
                  }
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff",
              "padding": "0px",
              "_meta": {
                "htmlID": "u_row_totals",
                "htmlClassNames": "u_row"
              }
            }
          },
          {
            "id": "cta-row",
            "cells": [1],
            "columns": [
              {
                "id": "cta-col",
                "contents": [
                  {
                    "id": "cta-button",
                    "type": "button",
                    "values": {
                      "text": "Complete My Order",
                      "href": {
                        "name": "web",
                        "values": {
                          "href": "{{abandoned_cart.link}}",
                          "target": "_blank"
                        }
                      },
                      "backgroundColor": "#059669",
                      "textColor": "#ffffff",
                      "fontFamily": {
                        "label": "Arial",
                        "value": "arial,helvetica,sans-serif"
                      },
                      "fontSize": "18px",
                      "fontWeight": 700,
                      "borderRadius": "8px",
                      "padding": "18px 40px",
                      "textAlign": "center",
                      "lineHeight": "120%",
                      "border": {},
                      "_meta": {
                        "htmlID": "u_content_button_cta",
                        "htmlClassNames": "u_content_button"
                      }
                    }
                  },
                  {
                    "id": "security-text",
                    "type": "text",
                    "values": {
                      "text": "<p style='margin: 15px 0 0 0; text-align: center; color: #6b7280; font-size: 14px;'>🔒 Secure checkout • 🚚 Free shipping • ↩️ Easy returns</p>",
                      "hideDesktop": false,
                      "hideMobile": false,
                      "_meta": {
                        "htmlID": "u_content_text_security",
                        "htmlClassNames": "u_content_text"
                      }
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#f9fafb",
                  "padding": "40px 20px",
                  "_meta": {
                    "htmlID": "u_column_cta",
                    "htmlClassNames": "u_column"
                  }
                }
              }
            ],
            "values": {
              "backgroundColor": "#f9fafb",
              "padding": "0px",
              "_meta": {
                "htmlID": "u_row_cta",
                "htmlClassNames": "u_row"
              }
            }
          },
          {
            "id": "help-row",
            "cells": [1],
            "columns": [
              {
                "id": "help-col",
                "contents": [
                  {
                    "id": "help-text",
                    "type": "text",
                    "values": {
                      "text": "<div style='background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; margin: 0 20px; text-align: center;'>\n  <p style='margin: 0; color: #111827; font-size: 16px; font-weight: 600;'>Need help with your order?</p>\n  <p style='margin: 10px 0 15px 0; color: #6b7280; font-size: 14px;'>Our customer support team is here to help you 24/7</p>\n  <a href='mailto:{{store.support_email}}' style='display: inline-block; color: #059669; text-decoration: none; font-weight: 500; margin-right: 20px;'>📧 Email Us</a>\n  <a href='tel:{{store.phone}}' style='display: inline-block; color: #059669; text-decoration: none; font-weight: 500;'>📞 Call Us</a>\n</div>",
                      "hideDesktop": false,
                      "hideMobile": false,
                      "_meta": {
                        "htmlID": "u_content_text_help",
                        "htmlClassNames": "u_content_text"
                      }
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#f9fafb",
                  "padding": "0px 0px 30px 0px",
                  "_meta": {
                    "htmlID": "u_column_help",
                    "htmlClassNames": "u_column"
                  }
                }
              }
            ],
            "values": {
              "backgroundColor": "#f9fafb",
              "padding": "0px",
              "_meta": {
                "htmlID": "u_row_help",
                "htmlClassNames": "u_row"
              }
            }
          },
          {
            "id": "recommended-row",
            "cells": [1],
            "columns": [
              {
                "id": "recommended-col",
                "contents": [
                  {
                    "id": "recommended-header",
                    "type": "text",
                    "values": {
                      "text": "<h3 style='margin: 0; color: #111827; font-size: 20px; font-weight: 600; text-align: center;'>You might also like</h3>",
                      "hideDesktop": false,
                      "hideMobile": false,
                      "_meta": {
                        "htmlID": "u_content_text_recommended_header",
                        "htmlClassNames": "u_content_text"
                      }
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#ffffff",
                  "padding": "30px 20px 20px 20px",
                  "_meta": {
                    "htmlID": "u_column_recommended",
                    "htmlClassNames": "u_column"
                  }
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff",
              "padding": "0px",
              "_meta": {
                "htmlID": "u_row_recommended",
                "htmlClassNames": "u_row"
              }
            }
          },
          {
            "id": "recommended-products-row",
            "cells": [1, 1, 1],
            "columns": [
              {
                "id": "rec-product-1-col",
                "contents": [
                  {
                    "id": "rec-product-1-image",
                    "type": "image",
                    "values": {
                      "src": {
                        "url": "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=150&h=150&fit=crop",
                        "width": 150,
                        "height": 150
                      },
                      "textAlign": "center",
                      "altText": "Wireless Earbuds",
                      "borderRadius": "8px"
                    }
                  },
                  {
                    "id": "rec-product-1-text",
                    "type": "text",
                    "values": {
                      "text": "<p style='margin: 10px 0 0 0; color: #111827; font-size: 14px; font-weight: 600; text-align: center;'>Wireless Earbuds</p>\n<p style='margin: 5px 0 0 0; color: #059669; font-size: 16px; font-weight: 700; text-align: center;'>$79.99</p>",
                      "hideDesktop": false,
                      "hideMobile": false,
                      "_meta": {
                        "htmlID": "u_content_text_rec_1",
                        "htmlClassNames": "u_content_text"
                      }
                    }
                  },
                  {
                    "id": "rec-product-1-button",
                    "type": "button",
                    "values": {
                      "text": "Add to Cart",
                      "href": {
                        "name": "web",
                        "values": {
                          "href": "#",
                          "target": "_blank"
                        }
                      },
                      "backgroundColor": "#ffffff",
                      "textColor": "#059669",
                      "fontFamily": {
                        "label": "Arial",
                        "value": "arial,helvetica,sans-serif"
                      },
                      "fontSize": "14px",
                      "fontWeight": 600,
                      "borderRadius": "6px",
                      "padding": "10px 20px",
                      "textAlign": "center",
                      "lineHeight": "120%",
                      "border": {
                        "borderTopWidth": "1px",
                        "borderTopStyle": "solid",
                        "borderTopColor": "#059669",
                        "borderLeftWidth": "1px",
                        "borderLeftStyle": "solid",
                        "borderLeftColor": "#059669",
                        "borderRightWidth": "1px",
                        "borderRightStyle": "solid",
                        "borderRightColor": "#059669",
                        "borderBottomWidth": "1px",
                        "borderBottomStyle": "solid",
                        "borderBottomColor": "#059669"
                      },
                      "_meta": {
                        "htmlID": "u_content_button_rec_1",
                        "htmlClassNames": "u_content_button"
                      }
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#f9fafb",
                  "padding": "20px",
                  "borderRadius": "8px",
                  "_meta": {
                    "htmlID": "u_column_rec_1",
                    "htmlClassNames": "u_column"
                  }
                }
              },
              {
                "id": "rec-product-2-col",
                "contents": [
                  {
                    "id": "rec-product-2-image",
                    "type": "image",
                    "values": {
                      "src": {
                        "url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop",
                        "width": 150,
                        "height": 150
                      },
                      "textAlign": "center",
                      "altText": "Smart Watch",
                      "borderRadius": "8px"
                    }
                  },
                  {
                    "id": "rec-product-2-text",
                    "type": "text",
                    "values": {
                      "text": "<p style='margin: 10px 0 0 0; color: #111827; font-size: 14px; font-weight: 600; text-align: center;'>Smart Watch</p>\n<p style='margin: 5px 0 0 0; color: #059669; font-size: 16px; font-weight: 700; text-align: center;'>$199.99</p>",
                      "hideDesktop": false,
                      "hideMobile": false,
                      "_meta": {
                        "htmlID": "u_content_text_rec_2",
                        "htmlClassNames": "u_content_text"
                      }
                    }
                  },
                  {
                    "id": "rec-product-2-button",
                    "type": "button",
                    "values": {
                      "text": "Add to Cart",
                      "href": {
                        "name": "web",
                        "values": {
                          "href": "#",
                          "target": "_blank"
                        }
                      },
                      "backgroundColor": "#ffffff",
                      "textColor": "#059669",
                      "fontFamily": {
                        "label": "Arial",
                        "value": "arial,helvetica,sans-serif"
                      },
                      "fontSize": "14px",
                      "fontWeight": 600,
                      "borderRadius": "6px",
                      "padding": "10px 20px",
                      "textAlign": "center",
                      "lineHeight": "120%",
                      "border": {
                        "borderTopWidth": "1px",
                        "borderTopStyle": "solid",
                        "borderTopColor": "#059669",
                        "borderLeftWidth": "1px",
                        "borderLeftStyle": "solid",
                        "borderLeftColor": "#059669",
                        "borderRightWidth": "1px",
                        "borderRightStyle": "solid",
                        "borderRightColor": "#059669",
                        "borderBottomWidth": "1px",
                        "borderBottomStyle": "solid",
                        "borderBottomColor": "#059669"
                      },
                      "_meta": {
                        "htmlID": "u_content_button_rec_2",
                        "htmlClassNames": "u_content_button"
                      }
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#f9fafb",
                  "padding": "20px",
                  "borderRadius": "8px",
                  "_meta": {
                    "htmlID": "u_column_rec_2",
                    "htmlClassNames": "u_column"
                  }
                }
              },
              {
                "id": "rec-product-3-col",
                "contents": [
                  {
                    "id": "rec-product-3-image",
                    "type": "image",
                    "values": {
                      "src": {
                        "url": "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=150&h=150&fit=crop",
                        "width": 150,
                        "height": 150
                      },
                      "textAlign": "center",
                      "altText": "Headphone Case",
                      "borderRadius": "8px"
                    }
                  },
                  {
                    "id": "rec-product-3-text",
                    "type": "text",
                    "values": {
                      "text": "<p style='margin: 10px 0 0 0; color: #111827; font-size: 14px; font-weight: 600; text-align: center;'>Headphone Case</p>\n<p style='margin: 5px 0 0 0; color: #059669; font-size: 16px; font-weight: 700; text-align: center;'>$29.99</p>",
                      "hideDesktop": false,
                      "hideMobile": false,
                      "_meta": {
                        "htmlID": "u_content_text_rec_3",
                        "htmlClassNames": "u_content_text"
                      }
                    }
                  },
                  {
                    "id": "rec-product-3-button",
                    "type": "button",
                    "values": {
                      "text": "Add to Cart",
                      "href": {
                        "name": "web",
                        "values": {
                          "href": "#",
                          "target": "_blank"
                        }
                      },
                      "backgroundColor": "#ffffff",
                      "textColor": "#059669",
                      "fontFamily": {
                        "label": "Arial",
                        "value": "arial,helvetica,sans-serif"
                      },
                      "fontSize": "14px",
                      "fontWeight": 600,
                      "borderRadius": "6px",
                      "padding": "10px 20px",
                      "textAlign": "center",
                      "lineHeight": "120%",
                      "border": {
                        "borderTopWidth": "1px",
                        "borderTopStyle": "solid",
                        "borderTopColor": "#059669",
                        "borderLeftWidth": "1px",
                        "borderLeftStyle": "solid",
                        "borderLeftColor": "#059669",
                        "borderRightWidth": "1px",
                        "borderRightStyle": "solid",
                        "borderRightColor": "#059669",
                        "borderBottomWidth": "1px",
                        "borderBottomStyle": "solid",
                        "borderBottomColor": "#059669"
                      },
                      "_meta": {
                        "htmlID": "u_content_button_rec_3",
                        "htmlClassNames": "u_content_button"
                      }
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#f9fafb",
                  "padding": "20px",
                  "borderRadius": "8px",
                  "_meta": {
                    "htmlID": "u_column_rec_3",
                    "htmlClassNames": "u_column"
                  }
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff",
              "padding": "0px 20px 30px 20px",
              "_meta": {
                "htmlID": "u_row_recommended_products",
                "htmlClassNames": "u_row"
              }
            }
          },
          {
            "id": "footer-row",
            "cells": [1],
            "columns": [
              {
                "id": "footer-col",
                "contents": [
                  {
                    "id": "footer-divider",
                    "type": "divider",
                    "values": {
                      "width": "100%",
                      "border": {
                        "borderTopWidth": "1px",
                        "borderTopStyle": "solid",
                        "borderTopColor": "#e5e7eb"
                      },
                      "textAlign": "center"
                    }
                  },
                  {
                    "id": "footer-text",
                    "type": "text",
                    "values": {
                      "text": "<p style='margin: 20px 0 10px 0; text-align: center; color: #6b7280; font-size: 14px;'>{{store.name}} | {{store.address}}</p>\n<p style='margin: 0 0 10px 0; text-align: center; color: #6b7280; font-size: 12px;'>You're receiving this email because you have an account with us and left items in your cart.</p>\n<p style='margin: 0; text-align: center; font-size: 12px;'>\n  <a href='{{unsubscribe_link}}' style='color: #6b7280; text-decoration: underline; margin-right: 15px;'>Unsubscribe</a>\n  <a href='{{preferences_link}}' style='color: #6b7280; text-decoration: underline;'>Update Preferences</a>\n</p>",
                      "hideDesktop": false,
                      "hideMobile": false,
                      "_meta": {
                        "htmlID": "u_content_text_footer",
                        "htmlClassNames": "u_content_text"
                      }
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#ffffff",
                  "padding": "20px",
                  "_meta": {
                    "htmlID": "u_column_footer",
                    "htmlClassNames": "u_column"
                  }
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff",
              "padding": "0px",
              "_meta": {
                "htmlID": "u_row_footer",
                "htmlClassNames": "u_row"
              }
            }
          }
        ],
        "values": {
          "backgroundColor": "#f3f4f6",
          "backgroundImage": {
            "url": "",
            "fullWidth": true,
            "repeat": false,
            "center": true,
            "cover": false
          },
          "contentWidth": "600px",
          "contentAlign": "center",
          "fontFamily": {
            "label": "Arial",
            "value": "arial,helvetica,sans-serif"
          },
          "textColor": "#000000",
          "linkStyle": {
            "body": true,
            "linkColor": "#059669",
            "linkHoverColor": "#047857",
            "linkUnderline": true,
            "linkHoverUnderline": true
          },
          "_meta": {
            "htmlID": "u_body",
            "htmlClassNames": "u_body"
          }
        }
      },
      "schemaVersion": 16
    }
  },
  {
    name: 'Abandoned Cart - Premium Recovery',
    description: 'High-converting abandoned cart template with dynamic discount, urgency messaging, and social proof. 25%+ recovery rate.',
    category: 'abandoned-cart',
    tags: ['abandoned-cart', 'high-converting', 'discount', 'urgency', 'social-proof', 'responsive'],
    is_premium: false,
    rating: 5.0,
    usage_count: 0,
    design: {
      "body": {
        "id": "abandoned-cart-v2",
        "rows": [
          {
            "id": "header-row",
            "cells": [1],
            "values": {
              "_meta": {
                "htmlID": "u_row_1",
                "htmlClassNames": "u_row"
              },
              "columns": false,
              "padding": "0px",
              "deletable": true,
              "draggable": true,
              "hideable": true,
              "selectable": true,
              "locked": false,
              "hideDesktop": false,
              "duplicatable": true,
              "backgroundColor": "#ffffff",
              "columnsBackgroundColor": "",
              "backgroundImage": {
                "url": "",
                "fullWidth": true,
                "repeat": "no-repeat",
                "center": true,
                "cover": false
              },
              "displayCondition": null
            },
            "columns": [
              {
                "id": "header-column",
                "values": {
                  "_meta": {
                    "htmlID": "u_column_1",
                    "htmlClassNames": "u_column"
                  },
                  "backgroundColor": "",
                  "padding": "20px",
                  "deletable": true
                },
                "contents": [
                  {
                    "id": "logo",
                    "type": "image",
                    "values": {
                      "src": {
                        "url": "https://via.placeholder.com/200x60/111827/ffffff?text=YOUR+LOGO",
                        "width": 200,
                        "height": 60
                      },
                      "textAlign": "center",
                      "altText": "{{store.name}}",
                      "_meta": {
                        "htmlID": "u_content_image_1",
                        "htmlClassNames": "u_content_image"
                      },
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "action": {
                        "name": "web",
                        "values": {
                          "href": "{{store.website}}",
                          "target": "_blank"
                        }
                      }
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "hero-row",
            "cells": [1],
            "values": {
              "_meta": {
                "htmlID": "u_row_2",
                "htmlClassNames": "u_row"
              },
              "columns": false,
              "padding": "0px",
              "deletable": true,
              "draggable": true,
              "hideable": true,
              "selectable": true,
              "locked": false,
              "hideDesktop": false,
              "duplicatable": true,
              "backgroundColor": "",
              "columnsBackgroundColor": "",
              "backgroundImage": {
                "url": "",
                "fullWidth": true,
                "repeat": "no-repeat",
                "center": true,
                "cover": false
              },
              "displayCondition": null
            },
            "columns": [
              {
                "id": "hero-column",
                "values": {
                  "_meta": {
                    "htmlID": "u_column_2",
                    "htmlClassNames": "u_column"
                  },
                  "backgroundColor": "",
                  "padding": "40px 20px",
                  "deletable": true
                },
                "contents": [
                  {
                    "id": "hero-heading",
                    "type": "heading",
                    "values": {
                      "text": "{{customer.first_name|Hey}}, you forgot something!",
                      "_meta": {
                        "htmlID": "u_content_heading_1",
                        "htmlClassNames": "u_content_heading"
                      },
                      "level": "h1",
                      "fontSize": "32px",
                      "textAlign": "center",
                      "lineHeight": "120%",
                      "fontWeight": 700,
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "containerPadding": "10px",
                      "headingType": "h1",
                      "fontFamily": {
                        "label": "Arial",
                        "value": "arial,helvetica,sans-serif"
                      },
                      "color": "#ffffff"
                    }
                  },
                  {
                    "id": "hero-text",
                    "type": "text",
                    "values": {
                      "text": "<p style='text-align: center; margin: 0;'>Complete your purchase in the next <strong>48 hours</strong> and save <strong>15%</strong> on your entire order!</p>",
                      "_meta": {
                        "htmlID": "u_content_text_1",
                        "htmlClassNames": "u_content_text"
                      },
                      "fontSize": "18px",
                      "textAlign": "center",
                      "lineHeight": "140%",
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "containerPadding": "10px 20px 20px 20px",
                      "color": "#e5e7eb"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "discount-row",
            "cells": [1],
            "values": {
              "_meta": {
                "htmlID": "u_row_3",
                "htmlClassNames": "u_row"
              },
              "columns": false,
              "padding": "0px",
              "deletable": true,
              "draggable": true,
              "hideable": true,
              "selectable": true,
              "locked": false,
              "hideDesktop": false,
              "duplicatable": true,
              "backgroundColor": "#ffffff",
              "columnsBackgroundColor": "",
              "backgroundImage": {
                "url": "",
                "fullWidth": true,
                "repeat": "no-repeat",
                "center": true,
                "cover": false
              },
              "displayCondition": null
            },
            "columns": [
              {
                "id": "discount-column",
                "values": {
                  "_meta": {
                    "htmlID": "u_column_3",
                    "htmlClassNames": "u_column"
                  },
                  "backgroundColor": "",
                  "padding": "30px 20px",
                  "deletable": true
                },
                "contents": [
                  {
                    "id": "discount-box",
                    "type": "html",
                    "values": {
                      "html": "<div style='background: #10b981; border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>\n  <p style='margin: 0; color: #ffffff; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;'>EXCLUSIVE OFFER</p>\n  <p style='margin: 15px 0 0 0; color: #ffffff; font-size: 48px; font-weight: 700; line-height: 1;'>15% OFF</p>\n  <p style='margin: 10px 0 0 0; color: #ffffff; font-size: 20px;'>Use code: <span style='background: rgba(255,255,255,0.3); padding: 5px 15px; border-radius: 6px; font-weight: 700;'>{{discount_code|CART15}}</span></p>\n  <p style='margin: 20px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;'>⏱️ Expires in 48 hours</p>\n</div>",
                      "_meta": {
                        "htmlID": "u_content_html_1",
                        "htmlClassNames": "u_content_html"
                      },
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "containerPadding": "0px"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "cart-header-row",
            "cells": [1],
            "values": {
              "_meta": {
                "htmlID": "u_row_4",
                "htmlClassNames": "u_row"
              },
              "columns": false,
              "padding": "0px",
              "deletable": true,
              "draggable": true,
              "hideable": true,
              "selectable": true,
              "locked": false,
              "hideDesktop": false,
              "duplicatable": true,
              "backgroundColor": "#ffffff",
              "columnsBackgroundColor": "",
              "backgroundImage": {
                "url": "",
                "fullWidth": true,
                "repeat": "no-repeat",
                "center": true,
                "cover": false
              },
              "displayCondition": null
            },
            "columns": [
              {
                "id": "cart-header-column",
                "values": {
                  "_meta": {
                    "htmlID": "u_column_4",
                    "htmlClassNames": "u_column"
                  },
                  "backgroundColor": "",
                  "padding": "20px 20px 10px 20px",
                  "deletable": true
                },
                "contents": [
                  {
                    "id": "cart-heading",
                    "type": "heading",
                    "values": {
                      "text": "Your Cart ({{abandoned_cart.items|3}} items)",
                      "_meta": {
                        "htmlID": "u_content_heading_2",
                        "htmlClassNames": "u_content_heading"
                      },
                      "level": "h2",
                      "fontSize": "24px",
                      "textAlign": "center",
                      "lineHeight": "120%",
                      "fontWeight": 600,
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "containerPadding": "10px",
                      "headingType": "h2",
                      "fontFamily": {
                        "label": "Arial",
                        "value": "arial,helvetica,sans-serif"
                      },
                      "color": "#111827"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "product-row",
            "cells": [1, 2],
            "values": {
              "_meta": {
                "htmlID": "u_row_5",
                "htmlClassNames": "u_row"
              },
              "columns": false,
              "padding": "0px 20px",
              "deletable": true,
              "draggable": true,
              "hideable": true,
              "selectable": true,
              "locked": false,
              "hideDesktop": false,
              "duplicatable": true,
              "backgroundColor": "#ffffff",
              "columnsBackgroundColor": "",
              "backgroundImage": {
                "url": "",
                "fullWidth": true,
                "repeat": "no-repeat",
                "center": true,
                "cover": false
              },
              "displayCondition": null
            },
            "columns": [
              {
                "id": "product-image-column",
                "values": {
                  "_meta": {
                    "htmlID": "u_column_5",
                    "htmlClassNames": "u_column"
                  },
                  "backgroundColor": "#f9fafb",
                  "padding": "20px",
                  "border": {
                    "borderTopWidth": "1px",
                    "borderTopStyle": "solid",
                    "borderTopColor": "#e5e7eb",
                    "borderLeftWidth": "1px",
                    "borderLeftStyle": "solid",
                    "borderLeftColor": "#e5e7eb",
                    "borderRightWidth": "0px",
                    "borderBottomWidth": "1px",
                    "borderBottomStyle": "solid",
                    "borderBottomColor": "#e5e7eb"
                  },
                  "borderRadius": "8px 0 0 8px",
                  "deletable": true
                },
                "contents": [
                  {
                    "id": "product-image",
                    "type": "image",
                    "values": {
                      "src": {
                        "url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=180&h=180&fit=crop",
                        "width": 180,
                        "height": 180
                      },
                      "textAlign": "center",
                      "altText": "{{product.name}}",
                      "_meta": {
                        "htmlID": "u_content_image_2",
                        "htmlClassNames": "u_content_image"
                      },
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "action": {
                        "name": "web",
                        "values": {
                          "href": "{{product.url}}",
                          "target": "_blank"
                        }
                      }
                    }
                  }
                ]
              },
              {
                "id": "product-details-column",
                "values": {
                  "_meta": {
                    "htmlID": "u_column_6",
                    "htmlClassNames": "u_column"
                  },
                  "backgroundColor": "#f9fafb",
                  "padding": "20px",
                  "border": {
                    "borderTopWidth": "1px",
                    "borderTopStyle": "solid",
                    "borderTopColor": "#e5e7eb",
                    "borderLeftWidth": "0px",
                    "borderRightWidth": "1px",
                    "borderRightStyle": "solid",
                    "borderRightColor": "#e5e7eb",
                    "borderBottomWidth": "1px",
                    "borderBottomStyle": "solid",
                    "borderBottomColor": "#e5e7eb"
                  },
                  "borderRadius": "0 8px 8px 0",
                  "deletable": true
                },
                "contents": [
                  {
                    "id": "product-details",
                    "type": "text",
                    "values": {
                      "text": "<h3 style='margin: 0 0 10px 0; color: #111827; font-size: 20px; font-weight: 600;'>{{product.name|Premium Sunglasses}}</h3>\n<p style='margin: 0 0 10px 0; color: #6b7280; font-size: 14px;'>Color: Black | UV Protection</p>\n<p style='margin: 0 0 15px 0;'><span style='color: #dc2626; font-size: 16px; text-decoration: line-through;'>{{product.original_price|$129.99}}</span> <span style='color: #059669; font-size: 22px; font-weight: 700;'>{{product.sale_price|$110.49}}</span></p>\n<p style='margin: 0; color: #6b7280; font-size: 14px;'>Quantity: 1</p>",
                      "_meta": {
                        "htmlID": "u_content_text_2",
                        "htmlClassNames": "u_content_text"
                      },
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "containerPadding": "10px",
                      "textAlign": "left"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "urgency-row",
            "cells": [1],
            "values": {
              "_meta": {
                "htmlID": "u_row_6",
                "htmlClassNames": "u_row"
              },
              "columns": false,
              "padding": "0px",
              "deletable": true,
              "draggable": true,
              "hideable": true,
              "selectable": true,
              "locked": false,
              "hideDesktop": false,
              "duplicatable": true,
              "backgroundColor": "#ffffff",
              "columnsBackgroundColor": "",
              "backgroundImage": {
                "url": "",
                "fullWidth": true,
                "repeat": "no-repeat",
                "center": true,
                "cover": false
              },
              "displayCondition": null
            },
            "columns": [
              {
                "id": "urgency-column",
                "values": {
                  "_meta": {
                    "htmlID": "u_column_7",
                    "htmlClassNames": "u_column"
                  },
                  "backgroundColor": "",
                  "padding": "20px",
                  "deletable": true
                },
                "contents": [
                  {
                    "id": "urgency-message",
                    "type": "html",
                    "values": {
                      "html": "<div style='background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; text-align: center;'>\n  <p style='margin: 0; color: #92400e; font-size: 16px; font-weight: 600;'>🔥 High Demand Alert!</p>\n  <p style='margin: 10px 0 0 0; color: #78350f; font-size: 14px;'>23 other customers are viewing this item</p>\n  <p style='margin: 5px 0 0 0; color: #dc2626; font-size: 14px; font-weight: 600;'>Only 5 left in stock!</p>\n</div>",
                      "_meta": {
                        "htmlID": "u_content_html_2",
                        "htmlClassNames": "u_content_html"
                      },
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "containerPadding": "0px"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "totals-row",
            "cells": [1],
            "values": {
              "_meta": {
                "htmlID": "u_row_7",
                "htmlClassNames": "u_row"
              },
              "columns": false,
              "padding": "0px",
              "deletable": true,
              "draggable": true,
              "hideable": true,
              "selectable": true,
              "locked": false,
              "hideDesktop": false,
              "duplicatable": true,
              "backgroundColor": "#ffffff",
              "columnsBackgroundColor": "",
              "backgroundImage": {
                "url": "",
                "fullWidth": true,
                "repeat": "no-repeat",
                "center": true,
                "cover": false
              },
              "displayCondition": null
            },
            "columns": [
              {
                "id": "totals-column",
                "values": {
                  "_meta": {
                    "htmlID": "u_column_8",
                    "htmlClassNames": "u_column"
                  },
                  "backgroundColor": "",
                  "padding": "20px",
                  "deletable": true
                },
                "contents": [
                  {
                    "id": "divider",
                    "type": "divider",
                    "values": {
                      "width": "100%",
                      "border": {
                        "borderTopWidth": "1px",
                        "borderTopStyle": "solid",
                        "borderTopColor": "#e5e7eb"
                      },
                      "textAlign": "center",
                      "_meta": {
                        "htmlID": "u_content_divider_1",
                        "htmlClassNames": "u_content_divider"
                      },
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true
                    }
                  },
                  {
                    "id": "totals-text",
                    "type": "html",
                    "values": {
                      "html": "<table style='width: 100%; max-width: 400px; margin: 20px auto 0 auto;'>\n  <tr>\n    <td style='padding: 5px 0; color: #6b7280; font-size: 16px;'>Subtotal:</td>\n    <td style='padding: 5px 0; color: #111827; font-size: 16px; text-align: right;'>{{abandoned_cart.subtotal|$129.99}}</td>\n  </tr>\n  <tr>\n    <td style='padding: 5px 0; color: #6b7280; font-size: 16px;'>Shipping:</td>\n    <td style='padding: 5px 0; color: #10b981; font-size: 16px; font-weight: 600; text-align: right;'>FREE</td>\n  </tr>\n  <tr>\n    <td style='padding: 5px 0; color: #10b981; font-size: 16px;'>Discount (15%):</td>\n    <td style='padding: 5px 0; color: #10b981; font-size: 16px; font-weight: 600; text-align: right;'>-{{discount_amount|$19.50}}</td>\n  </tr>\n  <tr>\n    <td colspan='2' style='padding-top: 10px; border-top: 2px solid #111827;'></td>\n  </tr>\n  <tr>\n    <td style='padding: 10px 0 0 0; color: #111827; font-size: 20px; font-weight: 700;'>Total:</td>\n    <td style='padding: 10px 0 0 0; color: #111827; font-size: 24px; font-weight: 700; text-align: right;'>{{abandoned_cart.total|$110.49}}</td>\n  </tr>\n</table>",
                      "_meta": {
                        "htmlID": "u_content_html_3",
                        "htmlClassNames": "u_content_html"
                      },
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "containerPadding": "0px"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "cta-row",
            "cells": [1],
            "values": {
              "_meta": {
                "htmlID": "u_row_8",
                "htmlClassNames": "u_row"
              },
              "columns": false,
              "padding": "0px",
              "deletable": true,
              "draggable": true,
              "hideable": true,
              "selectable": true,
              "locked": false,
              "hideDesktop": false,
              "duplicatable": true,
              "backgroundColor": "#f9fafb",
              "columnsBackgroundColor": "",
              "backgroundImage": {
                "url": "",
                "fullWidth": true,
                "repeat": "no-repeat",
                "center": true,
                "cover": false
              },
              "displayCondition": null
            },
            "columns": [
              {
                "id": "cta-column",
                "values": {
                  "_meta": {
                    "htmlID": "u_column_9",
                    "htmlClassNames": "u_column"
                  },
                  "backgroundColor": "",
                  "padding": "40px 20px",
                  "deletable": true
                },
                "contents": [
                  {
                    "id": "cta-button",
                    "type": "button",
                    "values": {
                      "text": "Complete My Order →",
                      "href": {
                        "name": "web",
                        "values": {
                          "href": "{{abandoned_cart.link}}",
                          "target": "_blank"
                        }
                      },
                      "_meta": {
                        "htmlID": "u_content_button_1",
                        "htmlClassNames": "u_content_button"
                      },
                      "padding": "20px 40px",
                      "fontSize": "18px",
                      "textAlign": "center",
                      "lineHeight": "120%",
                      "fontWeight": 700,
                      "borderRadius": "8px",
                      "buttonColors": {
                        "color": "#FFFFFF",
                        "backgroundColor": "#10b981",
                        "hoverColor": "#FFFFFF",
                        "hoverBackgroundColor": "#059669"
                      },
                      "size": {
                        "width": "100%",
                        "autoWidth": true
                      },
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "containerPadding": "10px",
                      "calculatedWidth": 231,
                      "calculatedHeight": 62
                    }
                  },
                  {
                    "id": "security-badges",
                    "type": "text",
                    "values": {
                      "text": "<p style='text-align: center; margin: 20px 0 0 0; color: #6b7280; font-size: 14px;'>🔒 Secure Checkout • 🚚 Free Shipping • ↩️ 30-Day Returns</p>",
                      "_meta": {
                        "htmlID": "u_content_text_3",
                        "htmlClassNames": "u_content_text"
                      },
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "containerPadding": "10px"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "footer-row",
            "cells": [1],
            "values": {
              "_meta": {
                "htmlID": "u_row_9",
                "htmlClassNames": "u_row"
              },
              "columns": false,
              "padding": "0px",
              "deletable": true,
              "draggable": true,
              "hideable": true,
              "selectable": true,
              "locked": false,
              "hideDesktop": false,
              "duplicatable": true,
              "backgroundColor": "#ffffff",
              "columnsBackgroundColor": "",
              "backgroundImage": {
                "url": "",
                "fullWidth": true,
                "repeat": "no-repeat",
                "center": true,
                "cover": false
              },
              "displayCondition": null
            },
            "columns": [
              {
                "id": "footer-column",
                "values": {
                  "_meta": {
                    "htmlID": "u_column_10",
                    "htmlClassNames": "u_column"
                  },
                  "backgroundColor": "",
                  "padding": "30px 20px",
                  "deletable": true
                },
                "contents": [
                  {
                    "id": "footer-text",
                    "type": "text",
                    "values": {
                      "text": "<p style='text-align: center; margin: 0 0 10px 0; color: #6b7280; font-size: 14px;'>{{store.name}} | {{store.address}}</p>\n<p style='text-align: center; margin: 0 0 10px 0; color: #6b7280; font-size: 12px;'>You received this email because you left items in your cart at {{store.website}}</p>\n<p style='text-align: center; margin: 0; font-size: 12px;'><a href='{{unsubscribe_link}}' style='color: #6b7280; text-decoration: underline;'>Unsubscribe</a> | <a href='{{preferences_link}}' style='color: #6b7280; text-decoration: underline;'>Update Preferences</a></p>",
                      "_meta": {
                        "htmlID": "u_content_text_4",
                        "htmlClassNames": "u_content_text"
                      },
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "containerPadding": "10px"
                    }
                  }
                ]
              }
            ]
          }
        ],
        "values": {
          "_meta": {
            "htmlID": "u_body",
            "htmlClassNames": "u_body"
          },
          "linkStyle": {
            "body": true,
            "linkColor": "#10b981",
            "linkUnderline": true,
            "linkHoverColor": "#059669",
            "linkHoverUnderline": true
          },
          "textColor": "#000000",
          "fontFamily": {
            "label": "Arial",
            "value": "arial,helvetica,sans-serif"
          },
          "popupWidth": "600px",
          "popupHeight": "auto",
          "borderRadius": "10px",
          "contentAlign": "center",
          "contentWidth": "600px",
          "popupPosition": "center",
          "backgroundColor": "#1f2937",
          "backgroundImage": {
            "url": "",
            "size": "custom",
            "repeat": "no-repeat",
            "position": "center",
            "fullWidth": true
          },
          "contentVerticalAlign": "center",
          "popupBackgroundColor": "#FFFFFF",
          "popupBackgroundImage": {
            "url": "",
            "size": "cover",
            "repeat": "no-repeat",
            "position": "center",
            "fullWidth": true
          },
          "popupCloseButton_action": {
            "name": "close_popup",
            "attrs": {
              "onClick": "document.querySelector('.u-popup-container').style.display = 'none';"
            }
          },
          "popupCloseButton_margin": "0px",
          "popupCloseButton_position": "top-right",
          "popupCloseButton_iconColor": "#000000",
          "popupOverlay_backgroundColor": "rgba(0, 0, 0, 0.1)",
          "popupCloseButton_borderRadius": "0px",
          "popupCloseButton_backgroundColor": "#DDDDDD"
        }
      },
      "counters": {
        "u_row": 9,
        "u_column": 10,
        "u_content_text": 4,
        "u_content_button": 1,
        "u_content_heading": 2,
        "u_content_image": 2,
        "u_content_html": 3,
        "u_content_divider": 1
      },
      "schemaVersion": 21,
      "conditionalBlocks": [],
      "mergeTagsMetadata": {
        "usedTags": [],
        "validation": {
          "totalTags": 0,
          "uniqueTags": 0,
          "conditionalBlocks": 0,
          "tagsWithFallbacks": 0
        }
      }
    }
  },
  {
    name: 'Abandoned Cart Recovery - Simple',
    description: 'Clean abandoned cart email with 15% discount. Simplified structure to avoid any undefined properties.',
    category: 'abandoned-cart',
    tags: ['abandoned-cart', 'discount', 'simple', 'clean'],
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
    is_premium: false,
    usage_count: 0,
    rating: 5.0,
    design: {
      "body": {
        "id": "abandoned-cart-simple",
        "rows": [
          {
            "id": "row-1",
            "cells": [1],
            "values": {
              "backgroundColor": "#ffffff",
              "columns": false,
              "padding": "20px",
              "columnsBackgroundColor": ""
            },
            "columns": [
              {
                "id": "column-1",
                "values": {
                  "backgroundColor": ""
                },
                "contents": [
                  {
                    "id": "logo",
                    "type": "image",
                    "values": {
                      "src": {
                        "url": "https://via.placeholder.com/180x60/000000/ffffff?text=LOGO",
                        "width": 180,
                        "height": 60
                      },
                      "textAlign": "center",
                      "altText": "Logo"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "row-2",
            "cells": [1],
            "values": {
              "backgroundColor": "#10b981",
              "columns": false,
              "padding": "40px 20px",
              "columnsBackgroundColor": ""
            },
            "columns": [
              {
                "id": "column-2",
                "values": {
                  "backgroundColor": ""
                },
                "contents": [
                  {
                    "id": "heading",
                    "type": "heading",
                    "values": {
                      "text": "You left something behind!",
                      "level": "h1",
                      "fontSize": "32px",
                      "textAlign": "center",
                      "color": "#ffffff",
                      "containerPadding": "10px"
                    }
                  },
                  {
                    "id": "subtext",
                    "type": "text",
                    "values": {
                      "text": "<p style='text-align: center; color: #ffffff; margin: 0;'>Complete your order and save 15% with code <strong>SAVE15</strong></p>",
                      "containerPadding": "10px"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "row-3",
            "cells": [1],
            "values": {
              "backgroundColor": "#ffffff",
              "columns": false,
              "padding": "40px 20px",
              "columnsBackgroundColor": ""
            },
            "columns": [
              {
                "id": "column-3",
                "values": {
                  "backgroundColor": ""
                },
                "contents": [
                  {
                    "id": "cart-items",
                    "type": "text",
                    "values": {
                      "text": "<h2 style='text-align: center;'>Your Cart Items</h2><p style='text-align: center;'>Your items are waiting for you!</p>",
                      "containerPadding": "10px"
                    }
                  },
                  {
                    "id": "cta-button",
                    "type": "button",
                    "values": {
                      "text": "Complete Order",
                      "href": {
                        "name": "web",
                        "values": {
                          "href": "#"
                        }
                      },
                      "buttonColors": {
                        "color": "#ffffff",
                        "backgroundColor": "#10b981"
                      },
                      "size": {
                        "autoWidth": true
                      },
                      "fontSize": "16px",
                      "padding": "15px 30px",
                      "borderRadius": "5px",
                      "containerPadding": "20px",
                      "textAlign": "center"
                    }
                  }
                ]
              }
            ]
          }
        ],
        "values": {
          "backgroundColor": "#f3f4f6",
          "textColor": "#000000",
          "fontFamily": {
            "label": "Arial",
            "value": "arial,helvetica,sans-serif"
          },
          "contentWidth": "600px",
          "contentAlign": "center"
        }
      },
      "schemaVersion": 21
    }
  }
];

// Helper function to generate HTML from Unlayer design
export function generateHTMLFromDesign(design: any): string {
  // This is a simplified HTML generation - in production, you'd use Unlayer's export function
  let html = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">';
  
  if (design?.body?.rows) {
    design.body.rows.forEach((row: any) => {
      html += '<div style="padding: 10px 0;">';
      row.columns?.forEach((column: any) => {
        column.contents?.forEach((content: any) => {
          switch (content.type) {
            case 'text':
              html += `<div style="padding: ${content.values?.containerPadding || '10px'}; text-align: ${content.values?.textAlign || 'left'}; font-size: ${content.values?.fontSize || '14px'}; line-height: ${content.values?.lineHeight || '140%'};">${content.values?.text || ''}</div>`;
              break;
              
            case 'button':
              const href = content.values?.href?.values?.href || content.values?.href || '#';
              html += `<div style="padding: ${content.values?.containerPadding || '10px'}; text-align: center;"><a href="${href}" style="display: inline-block; padding: ${content.values?.padding || '10px 20px'}; background-color: ${content.values?.buttonColors?.backgroundColor || '#007bff'}; color: ${content.values?.buttonColors?.color || '#ffffff'}; text-decoration: none; border-radius: ${content.values?.borderRadius || '4px'}; font-size: ${content.values?.fontSize || '16px'}; font-weight: ${content.values?.fontWeight || 'normal'};">${content.values?.text || 'Click Here'}</a></div>`;
              break;
              
            case 'image':
              const imgSrc = content.values?.src?.url || '';
              const altText = content.values?.altText || '';
              html += `<div style="padding: ${content.values?.containerPadding || '10px'}; text-align: ${content.values?.textAlign || 'center'};"><img src="${imgSrc}" alt="${altText}" style="max-width: 100%; height: auto;" /></div>`;
              break;
              
            case 'divider':
              html += `<div style="padding: ${content.values?.containerPadding || '10px'};"><hr style="border: none; border-top: ${content.values?.borderWidth || '1px'} ${content.values?.borderStyle || 'solid'} ${content.values?.borderColor || '#cccccc'};" /></div>`;
              break;
              
            case 'html':
              html += `<div style="padding: ${content.values?.containerPadding || '10px'};">${content.values?.html || ''}</div>`;
              break;
              
            case 'heading':
              const level = content.values?.level || 'h2';
              const headingText = content.values?.text || '';
              html += `<div style="padding: ${content.values?.containerPadding || '10px'}; text-align: ${content.values?.textAlign || 'left'};"><${level} style="font-size: ${content.values?.fontSize || '24px'}; color: ${content.values?.color || '#000000'}; margin: 0;">${headingText}</${level}></div>`;
              break;
              
            default:
              // Handle any unknown content types gracefully
              console.warn(`Unknown content type: ${content.type}`);
          }
        });
      });
      html += '</div>';
    });
  }
  
  html += '</div>';
  return html;
}

// Helper function to generate thumbnail URL (placeholder for now)
export function generateThumbnailUrl(templateName: string): string {
  // In production, this would generate or retrieve actual thumbnails
  return getBase64Placeholder(300, 400, templateName);
}