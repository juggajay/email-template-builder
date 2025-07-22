'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// This page is loaded by Shopify after OAuth completion
export default function ShopifyAppGrant() {
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop');
  const host = searchParams.get('host');

  useEffect(() => {
    // After OAuth is complete, redirect to the actual app interface
    // This happens inside Shopify's admin iframe
    if (shop && host) {
      // Use the full URL to ensure proper navigation within Shopify admin
      const appUrl = `https://${shop}/admin/apps/zebamail`;
      window.location.href = appUrl;
    }
  }, [shop, host]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Loading ZebaMail...</h1>
      <p style={{ fontSize: '16px', color: '#666' }}>
        Redirecting to your app...
      </p>
    </div>
  );
}