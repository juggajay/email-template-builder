import { redirect } from 'next/navigation';

// This page is loaded by Shopify after OAuth completion
export default function ShopifyAppGrant({
  searchParams,
}: {
  searchParams: { shop?: string; host?: string };
}) {
  // If we have both shop and host params, this is after OAuth completion
  // Redirect to the app homepage
  if (searchParams.shop && searchParams.host) {
    redirect('/apps/zebamail');
  }

  // If we don't have the params, show a loading state
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