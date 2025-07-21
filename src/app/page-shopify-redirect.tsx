'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function ShopifyRedirectHandler() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check if we have Shopify OAuth params on the homepage
    const shop = searchParams.get('shop');
    const hmac = searchParams.get('hmac');
    const host = searchParams.get('host');
    const code = searchParams.get('code');
    
    // Only redirect if we have OAuth parameters but NOT a code (which means it's not OAuth callback)
    if (shop && hmac && host && !code) {
      console.log('Detected Shopify embedded app params:', {
        shop,
        hmac,
        host
      });
      
      // Redirect to our app page
      window.location.href = `/app/grant?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;
    }
  }, [searchParams]);
  
  return null;
}