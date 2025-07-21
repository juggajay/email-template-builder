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
      
      // Redirect to Shopify admin using the new format
      const appHandle = 'grant';
      const adminUrl = `https://${shop}/admin/apps/${appHandle}`;
      
      console.log('Redirecting to:', adminUrl);
      window.location.href = adminUrl;
    }
  }, [searchParams]);
  
  return null;
}