import { redirect } from 'next/navigation';

// This page handles when Shopify hits our /app/grant URL during installation
export default function ShopifyAppGrant({
  searchParams,
}: {
  searchParams: { shop?: string; host?: string };
}) {
  // If Shopify provides shop parameter, redirect to Shopify admin
  if (searchParams.shop) {
    const shopId = searchParams.shop.replace('.myshopify.com', '');
    // Redirect to Shopify admin's app grant page
    redirect(`https://admin.shopify.com/store/${shopId}/app/grant`);
  }

  // If no shop parameter, show a static page
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
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Installing ZebaMail</h1>
      <p style={{ fontSize: '16px', color: '#666' }}>
        Please wait while we complete the installation.
      </p>
    </div>
  );
}