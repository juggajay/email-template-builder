import { redirect } from 'next/navigation';

// Server Component to handle redirects
export default async function ShopifyApp({
  searchParams,
}: {
  searchParams: { shop?: string; host?: string };
}) {
  // If we have shop but no host, this is an installation attempt
  // Redirect to OAuth flow
  if (searchParams.shop && !searchParams.host) {
    redirect(`/api/shopify/auth?shop=${encodeURIComponent(searchParams.shop)}`);
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '40px'
      }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#1f2937'
          }}>
            ZebaMail Email Builder
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            Create and manage professional email templates for your Shopify store
          </p>
          {searchParams.shop && (
            <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
              Connected to: {searchParams.shop}
            </p>
          )}
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* Template Builder Card */}
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              Email Templates
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Design beautiful email templates with our drag-and-drop editor
            </p>
            <button style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Browse Templates
            </button>
          </div>

          {/* Campaigns Card */}
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              Campaigns
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Send targeted email campaigns to your customers
            </p>
            <button style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Create Campaign
            </button>
          </div>

          {/* Analytics Card */}
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              Analytics
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Track performance and optimize your email marketing
            </p>
            <button style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              View Reports
            </button>
          </div>
        </div>

        {/* Getting Started Section */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
            Ready to boost your email marketing?
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
            Start creating professional email templates that convert. 
            Our Shopify integration makes it easy to sync your products and customers.
          </p>
          <button style={{
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}