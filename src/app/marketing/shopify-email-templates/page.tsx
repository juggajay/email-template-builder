import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopify Email Templates | Professional Templates That Convert - ZebaMail',
  description: 'Beautiful, conversion-optimized email templates designed specifically for Shopify stores. Recover abandoned carts, welcome customers, and drive sales with proven templates.',
  keywords: 'shopify email templates, shopify email marketing, ecommerce email templates, abandoned cart email shopify, shopify email design',
  openGraph: {
    title: 'Shopify Email Templates That Convert | ZebaMail',
    description: 'Professional email templates built for Shopify. Recover 28.3% of abandoned carts.',
    images: ['/og-shopify-templates.png'],
  },
};

export default function ShopifyEmailTemplatesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Shopify Email Templates That Actually Convert
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Join 2,847 Shopify stores using our proven email templates to drive $127M in attributed revenue. No design skills needed.
        </p>
        
        <div className="grid gap-8">
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Abandoned Cart Recovery</h2>
            <p>Recover lost sales with urgency-driven templates</p>
            <p className="text-primary font-semibold">28.3% recovery rate</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Welcome Series</h2>
            <p>Turn subscribers into loyal customers</p>
            <p className="text-primary font-semibold">3.2x engagement</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Product Launch</h2>
            <p>Create buzz and drive early sales</p>
            <p className="text-primary font-semibold">47% open rate</p>
          </div>
        </div>
      </div>
    </main>
  );
}