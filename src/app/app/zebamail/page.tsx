'use client';

export default function AppPage() {
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
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#1f2937'
        }}>
          ZebaMail Dashboard
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '40px' }}>
          Welcome to your email marketing dashboard
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Quick Stats
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Total Templates</p>
                <p style={{ fontSize: '24px', fontWeight: '600' }}>0</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Active Campaigns</p>
                <p style={{ fontSize: '24px', fontWeight: '600' }}>0</p>
              </div>
            </div>
          </div>
          
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Recent Activity
            </h2>
            <p style={{ color: '#6b7280' }}>No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  );
}