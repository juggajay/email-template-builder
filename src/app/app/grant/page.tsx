'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function GrantContent() {
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop');
  const host = searchParams.get('host');

  useEffect(() => {
    // After grant, redirect to your main app interface
    if (shop && host) {
      // Redirect to your app's main page within Shopify admin
      window.location.href = `https://${shop}/admin/apps/${process.env.NEXT_PUBLIC_SHOPIFY_APP_HANDLE || 'zebamail'}`;
    }
  }, [shop, host]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Granting permissions...</h1>
      <p>Redirecting to ZebaMail...</p>
    </div>
  );
}

export default function ShopifyAppGrant() {
  return (
    <Suspense fallback={
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Loading...</h1>
      </div>
    }>
      <GrantContent />
    </Suspense>
  );
}