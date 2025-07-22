import { redirect } from 'next/navigation';

// This page handles two scenarios:
// 1. Initial app access from outside Shopify (redirect to Shopify admin)
// 2. After OAuth completion within Shopify (redirect to app homepage)
export default function ShopifyAppGrant({
  searchParams,
}: {
  searchParams: { shop?: string; host?: string };
}) {
  // Scenario 1: If we have shop but NO host, this is initial access from outside Shopify
  // We need to redirect to Shopify admin's app grant page
  if (searchParams.shop && !searchParams.host) {
    const shopId = searchParams.shop.replace('.myshopify.com', '');
    redirect(`https://admin.shopify.com/store/${shopId}/app/grant`);
  }

  // Scenario 2: If we have both shop and host, this is after OAuth within Shopify
  // Redirect to the app homepage
  if (searchParams.shop && searchParams.host) {
    redirect('/apps/zebamail');
  }

  // If neither scenario, show a loading state
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
        Please wait...
      </p>
    </div>
  );
}