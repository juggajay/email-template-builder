'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

function GrantContent() {
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop');
  const host = searchParams.get('host');

  useEffect(() => {
    // After permissions are granted, redirect to the app
    if (shop && host) {
      // Redirect to the app within Shopify admin at the expected URL
      window.location.href = `https://${shop}/admin/apps/zebamail`;
    }
  }, [shop, host]);

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