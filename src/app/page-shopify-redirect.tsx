'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function ShopifyRedirectHandler() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check if we have Shopify OAuth params
    const shop = searchParams.get('shop');
    const hmac = searchParams.get('hmac');
    const host = searchParams.get('host');
    
    if (shop && hmac && host) {
      console.log('Detected Shopify embedded app params:', {
        shop,
        hmac,
        host
      });
      
      // Extract shop ID
      const shopId = shop.replace('.myshopify.com', '');
      
      // Redirect to Shopify admin
      const appHandle = 'grant';
      const adminUrl = `https://admin.shopify.com/store/${shopId}/app/${appHandle}`;
      
      console.log('Redirecting to:', adminUrl);
      window.location.href = adminUrl;
    }
  }, [searchParams]);
  
  return null;
}