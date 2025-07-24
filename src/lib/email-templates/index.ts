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
  }
];

// Helper function to generate HTML from Unlayer design
export function generateHTMLFromDesign(design: any): string {
  // This is a simplified HTML generation - in production, you'd use Unlayer's export function
  let html = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">';
  
  if (design.body && design.body.rows) {
    design.body.rows.forEach((row: any) => {
      html += '<div style="padding: 10px 0;">';
      row.columns.forEach((column: any) => {
        column.contents.forEach((content: any) => {
          switch (content.type) {
            case 'text':
              html += `<div style="padding: ${content.values.containerPadding}; text-align: ${content.values.textAlign}; font-size: ${content.values.fontSize}; line-height: ${content.values.lineHeight};">${content.values.text}</div>`;
              break;
            case 'button':
              html += `<div style="padding: ${content.values.containerPadding}; text-align: center;"><a href="${content.values.href}" style="display: inline-block; padding: ${content.values.padding}; background-color: ${content.values.buttonColors.backgroundColor}; color: ${content.values.buttonColors.color}; text-decoration: none; border-radius: ${content.values.borderRadius}; font-size: ${content.values.fontSize}; font-weight: ${content.values.fontWeight};">${content.values.text}</a></div>`;
              break;
            case 'image':
              html += `<div style="padding: ${content.values.containerPadding}; text-align: ${content.values.textAlign};"><img src="${content.values.src.url}" alt="${content.values.altText}" style="max-width: 100%; height: auto;" /></div>`;
              break;
            case 'divider':
              html += `<div style="padding: ${content.values.containerPadding};"><hr style="border: none; border-top: ${content.values.borderWidth} ${content.values.borderStyle} ${content.values.borderColor};" /></div>`;
              break;
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