// Template designs for Unlayer editor
export const templateDesigns = {
  'abandoned-cart': {
    body: {
      rows: [
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'text',
                  values: {
                    containerPadding: '10px',
                    anchor: '',
                    fontSize: '24px',
                    textAlign: 'center',
                    lineHeight: '140%',
                    linkStyle: {
                      inherit: true,
                      linkColor: '#0000ee',
                      linkHoverColor: '#0000ee',
                      linkUnderline: true,
                      linkHoverUnderline: true
                    },
                    displayCondition: null,
                    _meta: {
                      htmlID: 'u_content_text_1',
                      htmlClassNames: 'u_content_text'
                    },
                    selectable: true,
                    draggable: true,
                    duplicatable: true,
                    deletable: true,
                    hideable: true,
                    text: '<p style="line-height: 140%;"><strong>You left something behind!</strong></p>'
                  }
                }
              ]
            }
          ]
        },
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'image',
                  values: {
                    containerPadding: '10px',
                    anchor: '',
                    src: {
                      url: 'https://via.placeholder.com/600x400?text=Product+Image',
                      width: 600,
                      height: 400
                    },
                    textAlign: 'center',
                    altText: 'Product Image',
                    action: {
                      name: 'web',
                      values: {
                        href: '',
                        target: '_blank'
                      }
                    },
                    displayCondition: null,
                    _meta: {
                      htmlID: 'u_content_image_1',
                      htmlClassNames: 'u_content_image'
                    },
                    selectable: true,
                    draggable: true,
                    duplicatable: true,
                    deletable: true,
                    hideable: true
                  }
                }
              ]
            }
          ]
        },
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'text',
                  values: {
                    containerPadding: '10px',
                    anchor: '',
                    fontSize: '16px',
                    textAlign: 'center',
                    lineHeight: '140%',
                    linkStyle: {
                      inherit: true,
                      linkColor: '#0000ee',
                      linkHoverColor: '#0000ee',
                      linkUnderline: true,
                      linkHoverUnderline: true
                    },
                    displayCondition: null,
                    _meta: {
                      htmlID: 'u_content_text_2',
                      htmlClassNames: 'u_content_text'
                    },
                    selectable: true,
                    draggable: true,
                    duplicatable: true,
                    deletable: true,
                    hideable: true,
                    text: '<p style="line-height: 140%;">Complete your purchase and get <strong>10% OFF</strong> with code: <strong>COMEBACK10</strong></p>'
                  }
                }
              ]
            }
          ]
        },
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'button',
                  values: {
                    containerPadding: '10px',
                    anchor: '',
                    href: {
                      name: 'web',
                      values: {
                        href: '',
                        target: '_blank'
                      }
                    },
                    buttonColors: {
                      color: '#FFFFFF',
                      backgroundColor: '#3AAEE0',
                      hoverColor: '#FFFFFF',
                      hoverBackgroundColor: '#3AAEE0'
                    },
                    size: {
                      autoWidth: true,
                      width: '100%'
                    },
                    textAlign: 'center',
                    lineHeight: '120%',
                    padding: '10px 20px',
                    border: {},
                    borderRadius: '4px',
                    displayCondition: null,
                    _meta: {
                      htmlID: 'u_content_button_1',
                      htmlClassNames: 'u_content_button'
                    },
                    selectable: true,
                    draggable: true,
                    duplicatable: true,
                    deletable: true,
                    hideable: true,
                    text: '<span style="font-size: 16px; line-height: 19.2px;"><strong>Complete My Order</strong></span>'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },
  'welcome': {
    body: {
      rows: [
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'text',
                  values: {
                    containerPadding: '10px',
                    fontSize: '32px',
                    textAlign: 'center',
                    lineHeight: '140%',
                    text: '<p style="line-height: 140%;"><strong>Welcome to Our Store!</strong></p>'
                  }
                }
              ]
            }
          ]
        },
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'text',
                  values: {
                    containerPadding: '10px',
                    fontSize: '16px',
                    textAlign: 'center',
                    lineHeight: '140%',
                    text: '<p style="line-height: 140%;">Thank you for joining our community. As a welcome gift, enjoy <strong>15% OFF</strong> your first purchase!</p>'
                  }
                }
              ]
            }
          ]
        },
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'button',
                  values: {
                    containerPadding: '10px',
                    href: {
                      name: 'web',
                      values: {
                        href: '',
                        target: '_blank'
                      }
                    },
                    buttonColors: {
                      color: '#FFFFFF',
                      backgroundColor: '#4CAF50'
                    },
                    size: {
                      autoWidth: true,
                      width: '100%'
                    },
                    textAlign: 'center',
                    padding: '12px 24px',
                    text: '<strong>Shop Now</strong>'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },
  'order-confirmation': {
    body: {
      rows: [
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'text',
                  values: {
                    containerPadding: '10px',
                    fontSize: '28px',
                    textAlign: 'center',
                    lineHeight: '140%',
                    text: '<p style="line-height: 140%;"><strong>Order Confirmed!</strong></p>'
                  }
                }
              ]
            }
          ]
        },
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'text',
                  values: {
                    containerPadding: '10px',
                    fontSize: '16px',
                    textAlign: 'center',
                    lineHeight: '140%',
                    text: '<p style="line-height: 140%;">Thank you for your order. We\'re preparing your items for shipment.</p>'
                  }
                }
              ]
            }
          ]
        },
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'text',
                  values: {
                    containerPadding: '10px',
                    fontSize: '14px',
                    textAlign: 'left',
                    lineHeight: '140%',
                    text: '<p><strong>Order Details:</strong></p><ul><li>Order #: 12345</li><li>Total: $99.99</li><li>Estimated Delivery: 3-5 business days</li></ul>'
                  }
                }
              ]
            }
          ]
        },
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'button',
                  values: {
                    containerPadding: '10px',
                    href: {
                      name: 'web',
                      values: {
                        href: '',
                        target: '_blank'
                      }
                    },
                    buttonColors: {
                      color: '#FFFFFF',
                      backgroundColor: '#FF9800'
                    },
                    size: {
                      autoWidth: true,
                      width: '100%'
                    },
                    textAlign: 'center',
                    padding: '12px 24px',
                    text: '<strong>Track Order</strong>'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },
  'product-launch': {
    body: {
      rows: [
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'text',
                  values: {
                    containerPadding: '10px',
                    fontSize: '36px',
                    textAlign: 'center',
                    lineHeight: '140%',
                    text: '<p style="line-height: 140%;"><strong>Introducing Our Latest Product!</strong></p>'
                  }
                }
              ]
            }
          ]
        },
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'image',
                  values: {
                    containerPadding: '10px',
                    src: {
                      url: 'https://via.placeholder.com/600x400?text=New+Product',
                      width: 600,
                      height: 400
                    },
                    textAlign: 'center',
                    altText: 'New Product'
                  }
                }
              ]
            }
          ]
        },
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'text',
                  values: {
                    containerPadding: '10px',
                    fontSize: '16px',
                    textAlign: 'center',
                    lineHeight: '140%',
                    text: '<p style="line-height: 140%;">Be the first to experience our revolutionary new product. Limited time offer: <strong>20% OFF</strong> for early adopters!</p>'
                  }
                }
              ]
            }
          ]
        },
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'button',
                  values: {
                    containerPadding: '10px',
                    href: {
                      name: 'web',
                      values: {
                        href: '',
                        target: '_blank'
                      }
                    },
                    buttonColors: {
                      color: '#FFFFFF',
                      backgroundColor: '#E91E63'
                    },
                    size: {
                      autoWidth: true,
                      width: '100%'
                    },
                    textAlign: 'center',
                    padding: '14px 28px',
                    text: '<strong>Pre-Order Now</strong>'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },
  'promotional': {
    body: {
      rows: [
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'text',
                  values: {
                    containerPadding: '10px',
                    fontSize: '32px',
                    textAlign: 'center',
                    lineHeight: '140%',
                    text: '<p style="line-height: 140%;"><strong>Flash Sale - 48 Hours Only!</strong></p>'
                  }
                }
              ]
            }
          ]
        },
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'text',
                  values: {
                    containerPadding: '10px',
                    fontSize: '24px',
                    textAlign: 'center',
                    lineHeight: '140%',
                    color: '#FF0000',
                    text: '<p style="line-height: 140%;"><strong>UP TO 50% OFF</strong></p>'
                  }
                }
              ]
            }
          ]
        },
        {
          cells: [2, 2],
          columns: [
            {
              contents: [
                {
                  type: 'image',
                  values: {
                    containerPadding: '10px',
                    src: {
                      url: 'https://via.placeholder.com/250x250?text=Product+1',
                      width: 250,
                      height: 250
                    },
                    textAlign: 'center',
                    altText: 'Product 1'
                  }
                },
                {
                  type: 'text',
                  values: {
                    containerPadding: '5px',
                    fontSize: '14px',
                    textAlign: 'center',
                    text: '<p><strong>Product Name</strong><br><s>$99.99</s> <strong style="color: #FF0000;">$49.99</strong></p>'
                  }
                }
              ]
            },
            {
              contents: [
                {
                  type: 'image',
                  values: {
                    containerPadding: '10px',
                    src: {
                      url: 'https://via.placeholder.com/250x250?text=Product+2',
                      width: 250,
                      height: 250
                    },
                    textAlign: 'center',
                    altText: 'Product 2'
                  }
                },
                {
                  type: 'text',
                  values: {
                    containerPadding: '5px',
                    fontSize: '14px',
                    textAlign: 'center',
                    text: '<p><strong>Product Name</strong><br><s>$79.99</s> <strong style="color: #FF0000;">$39.99</strong></p>'
                  }
                }
              ]
            }
          ]
        },
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: 'button',
                  values: {
                    containerPadding: '10px',
                    href: {
                      name: 'web',
                      values: {
                        href: '',
                        target: '_blank'
                      }
                    },
                    buttonColors: {
                      color: '#FFFFFF',
                      backgroundColor: '#FF0000'
                    },
                    size: {
                      autoWidth: true,
                      width: '100%'
                    },
                    textAlign: 'center',
                    padding: '16px 32px',
                    text: '<strong>SHOP SALE NOW</strong>'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  }
};

// Helper function to get design by template name
export function getTemplateDesign(templateName: string): any {
  // Convert template name to category key
  const categoryMap: { [key: string]: keyof typeof templateDesigns } = {
    'abandoned cart reminder': 'abandoned-cart',
    'welcome series': 'welcome',
    'order confirmation': 'order-confirmation',
    'product launch': 'product-launch',
    'flash sale': 'promotional',
    'seasonal promotion': 'promotional',
    'black friday sale': 'promotional',
    'cyber monday deals': 'promotional',
    'customer review request': 'order-confirmation',
    'shipping notification': 'order-confirmation',
    'birthday discount': 'promotional',
    'vip exclusive': 'promotional',
    'restock alert': 'product-launch',
    'new collection': 'product-launch',
    'loyalty rewards': 'promotional'
  };

  const normalizedName = templateName.toLowerCase();
  
  // Try to find a matching category
  for (const [key, category] of Object.entries(categoryMap)) {
    if (normalizedName.includes(key)) {
      return templateDesigns[category];
    }
  }

  // If no specific match, return a default based on keywords
  if (normalizedName.includes('cart')) return templateDesigns['abandoned-cart'];
  if (normalizedName.includes('welcome')) return templateDesigns['welcome'];
  if (normalizedName.includes('order') || normalizedName.includes('confirm')) return templateDesigns['order-confirmation'];
  if (normalizedName.includes('launch') || normalizedName.includes('new')) return templateDesigns['product-launch'];
  
  // Default to promotional
  return templateDesigns['promotional'];
}