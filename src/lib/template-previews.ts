// Template preview HTML for thumbnails
export const templatePreviews = {
  'abandoned-cart': `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
      <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 20px;">You left something behind! 🛒</h1>
        <div style="background: #f0f0f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="width: 100px; height: 100px; background: #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #666;">
              Product Image
            </div>
            <div>
              <h3 style="margin: 0 0 5px 0; color: #333;">Premium Product</h3>
              <p style="margin: 0; color: #666;">Was in your cart</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; color: #e74c3c; font-weight: bold;">$49.99</p>
            </div>
          </div>
        </div>
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; text-align: center; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">Complete your purchase and get <strong>10% OFF</strong></p>
          <p style="margin: 5px 0 0 0; color: #856404;">Use code: <strong style="font-size: 18px;">COMEBACK10</strong></p>
        </div>
        <div style="text-align: center;">
          <a href="#" style="display: inline-block; background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Complete My Order</a>
        </div>
      </div>
    </div>
  `,
  
  'welcome': `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
      <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 80px; height: 80px; background: #4CAF50; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 40px;">🎉</span>
          </div>
          <h1 style="color: #333; font-size: 32px; margin: 0;">Welcome to Our Store!</h1>
        </div>
        <p style="color: #666; font-size: 16px; text-align: center; line-height: 1.6; margin: 20px 0;">
          Thank you for joining our community of over 50,000 happy customers. We're excited to have you here!
        </p>
        <div style="background: #e8f5e9; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <p style="margin: 0; color: #2e7d32; font-size: 18px;">As a welcome gift, enjoy</p>
          <p style="margin: 10px 0; color: #2e7d32; font-size: 36px; font-weight: bold;">15% OFF</p>
          <p style="margin: 0; color: #2e7d32;">your first purchase!</p>
        </div>
        <div style="text-align: center;">
          <a href="#" style="display: inline-block; background: #4CAF50; color: white; padding: 14px 40px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Start Shopping</a>
        </div>
      </div>
    </div>
  `,
  
  'order-confirmation': `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
      <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 80px; height: 80px; background: #4CAF50; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 40px; color: white;">✓</span>
          </div>
          <h1 style="color: #333; font-size: 28px; margin: 0;">Order Confirmed!</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Thank you for your purchase</p>
        </div>
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Order Details</h3>
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span style="color: #666;">Order Number:</span>
            <strong style="color: #333;">#12345</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span style="color: #666;">Order Date:</span>
            <strong style="color: #333;">Today</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span style="color: #666;">Total Amount:</span>
            <strong style="color: #333; font-size: 18px;">$99.99</strong>
          </div>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 15px 0;">
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span style="color: #666;">Estimated Delivery:</span>
            <strong style="color: #ff9800;">3-5 business days</strong>
          </div>
        </div>
        <div style="text-align: center;">
          <a href="#" style="display: inline-block; background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Track Your Order</a>
        </div>
      </div>
    </div>
  `,
  
  'product-launch': `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
      <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
          <h1 style="font-size: 36px; margin: 0;">Introducing Something Amazing</h1>
          <p style="font-size: 18px; margin: 15px 0 0 0; opacity: 0.9;">The future is here</p>
        </div>
        <div style="padding: 30px;">
          <div style="background: #f0f0f0; border-radius: 8px; height: 200px; display: flex; align-items: center; justify-content: center; color: #666; margin-bottom: 30px;">
            <div style="text-align: center;">
              <div style="font-size: 60px;">🚀</div>
              <p>New Product Image</p>
            </div>
          </div>
          <h2 style="color: #333; font-size: 24px; text-align: center; margin: 0 0 15px 0;">Revolutionary Features</h2>
          <p style="color: #666; font-size: 16px; text-align: center; line-height: 1.6; margin: 0 0 30px 0;">
            Be among the first to experience our groundbreaking new product that will change everything.
          </p>
          <div style="background: #fce4ec; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 30px 0;">
            <p style="margin: 0; color: #c2185b; font-size: 16px;">Early Bird Special</p>
            <p style="margin: 10px 0 0 0; color: #c2185b; font-size: 28px; font-weight: bold;">20% OFF</p>
            <p style="margin: 5px 0 0 0; color: #c2185b; font-size: 14px;">Limited time only</p>
          </div>
          <div style="text-align: center;">
            <a href="#" style="display: inline-block; background: #e91e63; color: white; padding: 14px 40px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Pre-Order Now</a>
          </div>
        </div>
      </div>
    </div>
  `,
  
  'promotional': `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
      <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="background: #ff0000; color: white; padding: 30px; text-align: center;">
          <h1 style="font-size: 32px; margin: 0;">FLASH SALE</h1>
          <p style="font-size: 48px; margin: 10px 0; font-weight: bold;">50% OFF</p>
          <p style="font-size: 18px; margin: 0;">48 Hours Only!</p>
        </div>
        <div style="padding: 30px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="text-align: center;">
              <div style="background: #f0f0f0; border-radius: 8px; height: 150px; display: flex; align-items: center; justify-content: center; color: #666; margin-bottom: 10px;">
                Product 1
              </div>
              <h3 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">Premium Item</h3>
              <p style="margin: 0;">
                <span style="text-decoration: line-through; color: #999;">$99.99</span>
                <strong style="color: #ff0000; font-size: 20px; margin-left: 10px;">$49.99</strong>
              </p>
            </div>
            <div style="text-align: center;">
              <div style="background: #f0f0f0; border-radius: 8px; height: 150px; display: flex; align-items: center; justify-content: center; color: #666; margin-bottom: 10px;">
                Product 2
              </div>
              <h3 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">Best Seller</h3>
              <p style="margin: 0;">
                <span style="text-decoration: line-through; color: #999;">$79.99</span>
                <strong style="color: #ff0000; font-size: 20px; margin-left: 10px;">$39.99</strong>
              </p>
            </div>
          </div>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; text-align: center; margin-bottom: 20px;">
            <p style="margin: 0; color: #856404;">Use code <strong>FLASH50</strong> at checkout</p>
          </div>
          <div style="text-align: center;">
            <a href="#" style="display: inline-block; background: #ff0000; color: white; padding: 16px 50px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 18px;">SHOP SALE NOW</a>
          </div>
        </div>
      </div>
    </div>
  `
};

// Get preview HTML for a template
export function getTemplatePreview(templateName: string, category: string): string {
  // Try to match by category first
  if (templatePreviews[category as keyof typeof templatePreviews]) {
    return templatePreviews[category as keyof typeof templatePreviews];
  }
  
  // Fallback based on template name keywords
  const lowerName = templateName.toLowerCase();
  
  if (lowerName.includes('cart') || lowerName.includes('abandoned')) {
    return templatePreviews['abandoned-cart'];
  } else if (lowerName.includes('welcome') || lowerName.includes('onboard')) {
    return templatePreviews['welcome'];
  } else if (lowerName.includes('order') || lowerName.includes('confirm') || lowerName.includes('receipt')) {
    return templatePreviews['order-confirmation'];
  } else if (lowerName.includes('launch') || lowerName.includes('new') || lowerName.includes('announce')) {
    return templatePreviews['product-launch'];
  } else {
    // Default to promotional for sales, discounts, etc.
    return templatePreviews['promotional'];
  }
}

// Generate data URL for thumbnail
export async function generateThumbnailDataUrl(html: string): Promise<string> {
  // This would normally use a service like Puppeteer or html2canvas
  // For now, we'll return a placeholder that indicates the template type
  const category = Object.keys(templatePreviews).find(key => 
    templatePreviews[key as keyof typeof templatePreviews] === html
  ) || 'promotional';
  
  // Return a data URL with SVG that shows the template type
  const svg = `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="400" fill="#f5f5f5"/>
      <rect x="20" y="20" width="560" height="360" fill="white" stroke="#ddd" stroke-width="1"/>
      <text x="300" y="200" font-family="Arial" font-size="24" fill="#666" text-anchor="middle">
        ${category.replace('-', ' ').toUpperCase()} TEMPLATE
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}