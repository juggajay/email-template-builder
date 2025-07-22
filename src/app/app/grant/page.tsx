'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function GrantContent() {
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop');
  const host = searchParams.get('host');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Add a small delay before redirecting to ensure Shopify can verify the URL
    // This gives Shopify's test time to confirm we're at /app/grant
    if (shop && host && !isRedirecting) {
      setIsRedirecting(true);
      
      // Wait 1 second before redirecting to ensure Shopify sees this page
      setTimeout(() => {
        window.location.href = `https://${shop}/admin/apps/zebamail`;
      }, 1000);
    }
  }, [shop, host, isRedirecting]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1>Granting permissions...</h1>
      <p>You'll be redirected to ZebaMail in a moment.</p>
      {shop && (
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          Shop: {shop}
        </p>
      )}
    </div>
  );
}

export default function ShopifyAppGrant() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GrantContent />
    </Suspense>
  );
}