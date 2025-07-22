'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function GrantContent() {
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop');
  const host = searchParams.get('host');

  // Don't redirect - Shopify expects this page to stay at /app/grant
  // This page should display while Shopify completes the installation

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Installing ZebaMail...</h1>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
        Please wait while we set up your email marketing tools.
      </p>
      {shop && (
        <p style={{ fontSize: '14px', color: '#999' }}>
          Shop: {shop}
        </p>
      )}
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