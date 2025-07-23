/**
 * Shopify Custom Blocks for Unlayer Editor
 */

export function registerShopifyBlocks(unlayer: any) {
  console.log('[ShopifyBlocks] Registering Shopify blocks...');

  // Register Product Block Tool
  unlayer.registerTool({
    name: 'shopify_product',
    label: 'Product',
    icon: 'fa-shopping-cart',
    supportedDisplayModes: ['email'],
    options: {
      default: {
        productId: null,
      },
      product: {
        title: 'Product Selection',
        position: 1,
        options: {
          productId: {
            label: 'Select Product',
            defaultValue: '',
            widget: 'dropdown',
            data: {
              options: [
                { label: 'No products synced', value: '' }
              ]
            }
          }
        }
      },
      layout: {
        title: 'Layout',
        position: 2,
        options: {
          imagePosition: {
            label: 'Image Position',
            defaultValue: 'left',
            widget: 'dropdown',
            data: {
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
                { label: 'Top', value: 'top' }
              ]
            }
          },
          showPrice: {
            label: 'Show Price',
            defaultValue: true,
            widget: 'toggle'
          },
          showDescription: {
            label: 'Show Description',
            defaultValue: true,
            widget: 'toggle'
          },
          buttonText: {
            label: 'Button Text',
            defaultValue: 'Shop Now',
            widget: 'text'
          }
        }
      }
    },
    values: {},
    renderer: {
      Viewer: (props: any) => {
        const { imagePosition, showPrice, showDescription, buttonText } = props;
        
        // This is a placeholder - in production, this would fetch real product data
        return `
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 20px;">
                <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
                  ${imagePosition === 'top' ? `
                    <img src="/images/template-placeholder.svg" 
                         alt="Product" 
                         style="width: 100%; max-width: 600px; height: auto; margin-bottom: 20px; border-radius: 4px;">
                  ` : ''}
                  
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      ${imagePosition === 'left' ? `
                        <td width="200" style="padding-right: 20px;">
                          <img src="/images/template-placeholder.svg" 
                               alt="Product" 
                               style="width: 100%; max-width: 200px; height: auto; border-radius: 4px;">
                        </td>
                      ` : ''}
                      
                      <td>
                        <h3 style="margin: 0 0 10px 0; color: #333;">Product Name</h3>
                        
                        ${showPrice ? `
                          <p style="margin: 0 0 10px 0; font-size: 24px; font-weight: bold; color: #2563eb;">
                            $99.99
                          </p>
                        ` : ''}
                        
                        ${showDescription ? `
                          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">
                            This is a sample product description. Your actual product description will appear here.
                          </p>
                        ` : ''}
                        
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="background-color: #2563eb; border-radius: 4px;">
                              <a href="#" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-weight: bold;">
                                ${buttonText}
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                      
                      ${imagePosition === 'right' ? `
                        <td width="200" style="padding-left: 20px;">
                          <img src="/images/template-placeholder.svg" 
                               alt="Product" 
                               style="width: 100%; max-width: 200px; height: auto; border-radius: 4px;">
                        </td>
                      ` : ''}
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
          </table>
        `;
      },
      exporters: {
        email: (props: any) => {
          // In production, this would use actual Shopify merge tags
          return {
            html: `{{#if shopify.product}}
              <!-- Shopify Product Block -->
              <div class="shopify-product">
                {{shopify.product.html}}
              </div>
            {{else}}
              <p>Product not found</p>
            {{/if}}`
          };
        }
      }
    }
  });

  // Register Product Grid Tool
  unlayer.registerTool({
    name: 'shopify_product_grid',
    label: 'Product Grid',
    icon: 'fa-th',
    supportedDisplayModes: ['email'],
    options: {
      default: {
        productCount: 4,
      },
      products: {
        title: 'Products',
        position: 1,
        options: {
          productCount: {
            label: 'Number of Products',
            defaultValue: 4,
            widget: 'dropdown',
            data: {
              options: [
                { label: '2 Products', value: 2 },
                { label: '3 Products', value: 3 },
                { label: '4 Products', value: 4 },
                { label: '6 Products', value: 6 }
              ]
            }
          },
          collection: {
            label: 'Collection',
            defaultValue: 'all',
            widget: 'dropdown',
            data: {
              options: [
                { label: 'All Products', value: 'all' },
                { label: 'Featured', value: 'featured' },
                { label: 'New Arrivals', value: 'new' },
                { label: 'Best Sellers', value: 'bestsellers' }
              ]
            }
          }
        }
      },
      layout: {
        title: 'Layout',
        position: 2,
        options: {
          columns: {
            label: 'Columns',
            defaultValue: 2,
            widget: 'dropdown',
            data: {
              options: [
                { label: '1 Column', value: 1 },
                { label: '2 Columns', value: 2 },
                { label: '3 Columns', value: 3 }
              ]
            }
          },
          showPrice: {
            label: 'Show Prices',
            defaultValue: true,
            widget: 'toggle'
          }
        }
      }
    },
    values: {},
    renderer: {
      Viewer: (props: any) => {
        const { productCount, columns, showPrice } = props;
        const width = columns === 1 ? '100%' : columns === 2 ? '48%' : '31%';
        
        let productsHtml = '';
        for (let i = 0; i < productCount; i++) {
          productsHtml += `
            <td width="${width}" style="padding: 10px; vertical-align: top;">
              <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; text-align: center;">
                <img src="/images/template-placeholder.svg+${i + 1}" 
                     alt="Product ${i + 1}" 
                     style="width: 100%; max-width: 200px; height: auto; margin-bottom: 10px; border-radius: 4px;">
                <h4 style="margin: 0 0 5px 0; color: #333;">Product ${i + 1}</h4>
                ${showPrice ? `<p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #2563eb;">$99.99</p>` : ''}
                <a href="#" style="display: inline-block; padding: 8px 16px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 14px;">
                  View Product
                </a>
              </div>
            </td>
            ${(i + 1) % columns === 0 && i < productCount - 1 ? '</tr><tr>' : ''}
          `;
        }
        
        return `
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 20px;">
            <tr>
              ${productsHtml}
            </tr>
          </table>
        `;
      }
    }
  });

  // Register Abandoned Cart Tool
  unlayer.registerTool({
    name: 'shopify_cart',
    label: 'Abandoned Cart',
    icon: 'fa-shopping-basket',
    supportedDisplayModes: ['email'],
    options: {
      default: {},
      content: {
        title: 'Content',
        position: 1,
        options: {
          title: {
            label: 'Title',
            defaultValue: 'You left something in your cart!',
            widget: 'text'
          },
          message: {
            label: 'Message',
            defaultValue: 'Complete your purchase before these items sell out.',
            widget: 'textarea'
          },
          buttonText: {
            label: 'Button Text',
            defaultValue: 'Complete Purchase',
            widget: 'text'
          }
        }
      }
    },
    values: {},
    renderer: {
      Viewer: (props: any) => {
        const { title, message, buttonText } = props;
        
        return `
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 20px;">
                <div style="border: 2px dashed #fbbf24; border-radius: 8px; padding: 30px; text-align: center; background-color: #fffbeb;">
                  <h2 style="margin: 0 0 10px 0; color: #92400e;">${title}</h2>
                  <p style="margin: 0 0 20px 0; color: #78350f; font-size: 16px;">${message}</p>
                  
                  <!-- Sample cart items -->
                  <table width="100%" cellpadding="10" cellspacing="0" border="0" style="margin: 20px 0;">
                    <tr>
                      <td width="80">
                        <img src="https://via.placeholder.com/80x80/f0f0f0/666?text=Item+1" 
                             alt="Cart Item" 
                             style="width: 80px; height: 80px; border-radius: 4px;">
                      </td>
                      <td style="text-align: left;">
                        <h4 style="margin: 0 0 5px 0;">Sample Product</h4>
                        <p style="margin: 0; color: #666;">Quantity: 1 - $49.99</p>
                      </td>
                    </tr>
                  </table>
                  
                  <table cellpadding="0" cellspacing="0" border="0" align="center">
                    <tr>
                      <td style="background-color: #f59e0b; border-radius: 4px;">
                        <a href="#" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                          ${buttonText}
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
          </table>
        `;
      }
    }
  });

  // Add Shopify category to the tools panel
  unlayer.registerPanel('shopify', {
    title: 'Shopify',
    icon: 'fa-shopping-bag',
    position: 3
  });

  // Assign tools to Shopify panel
  unlayer.updateTool('shopify_product', { panel: 'shopify' });
  unlayer.updateTool('shopify_product_grid', { panel: 'shopify' });
  unlayer.updateTool('shopify_cart', { panel: 'shopify' });

  console.log('[ShopifyBlocks] Shopify blocks registered successfully');
}

// Function to load products for dropdown
export async function loadShopifyProducts(): Promise<Array<{label: string, value: string}>> {
  try {
    const response = await fetch('/api/shopify/data/products');
    if (!response.ok) return [];
    
    const data = await response.json();
    if (!data.products || data.products.length === 0) {
      return [{ label: 'No products synced', value: '' }];
    }
    
    return data.products.map((product: any) => ({
      label: product.title,
      value: product.shopify_product_id || product.shopifyProductId
    }));
  } catch (error) {
    console.error('Error loading Shopify products:', error);
    return [{ label: 'Error loading products', value: '' }];
  }
}

// Function to check if user has Shopify connected
export async function hasShopifyConnection(): Promise<boolean> {
  try {
    const response = await fetch('/api/shopify/connection');
    if (!response.ok) return false;
    
    const data = await response.json();
    return !!(data.connection && data.connection.id);
  } catch (error) {
    console.error('Error checking Shopify connection:', error);
    return false;
  }
}