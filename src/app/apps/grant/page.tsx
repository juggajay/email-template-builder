'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ShopifyGrantAppPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get Shopify parameters
    const shop = searchParams.get('shop');
    const host = searchParams.get('host');
    
    // Redirect to the main Shopify app page with parameters
    const params = new URLSearchParams();
    if (shop) params.append('shop', shop);
    if (host) params.append('host', host);
    
    // Redirect to the actual app page
    window.location.href = `/shopify-app?${params.toString()}`;
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading ZebaMail...</p>
      </div>
    </div>
  );
}