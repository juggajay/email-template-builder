// This is a server component - no 'use client' directive
// Shopify needs to see this page at /app/grant without any immediate redirects

export default function ShopifyAppGrant() {
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
      <p style={{ fontSize: '14px', color: '#999', marginTop: '20px' }}>
        You will be redirected automatically.
      </p>
    </div>
  );
}