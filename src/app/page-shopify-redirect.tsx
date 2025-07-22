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
    
    // If we have a shop parameter, immediately start OAuth flow
    // This handles both embedded and non-embedded installation
    if (shop && !code) {
      console.log('Detected Shopify installation request:', {
        shop,
        hmac,
        host
      });
      
      // Immediately redirect to OAuth flow - no UI, no authentication check
      window.location.href = `/api/shopify/auth?shop=${encodeURIComponent(shop)}`;
    }
  }, [searchParams]);
  
  return null;
}