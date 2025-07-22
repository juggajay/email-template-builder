import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Abandoned Cart Email Templates | Recover 28.3% of Lost Sales - ZebaMail',
  description: 'Proven abandoned cart email templates that recover lost revenue. Used by 2,847 Shopify stores to recover $42M in abandoned carts. Free templates included.',
  keywords: 'abandoned cart email template, cart abandonment email, shopify abandoned cart, ecommerce cart recovery, abandoned checkout email',
  openGraph: {
    title: 'Abandoned Cart Email Templates That Recover Revenue | ZebaMail',
    description: 'Recover 28.3% of abandoned carts with our proven email templates. Free to try.',
    images: ['/og-abandoned-cart.png'],
  },
};

export default function AbandonedCartTemplatesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Abandoned Cart Email Templates That Recover Revenue
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Stop losing sales to abandoned carts. Our proven templates recover an average of 28.3% of abandoned carts within 24 hours.
        </p>
        
        <div className="grid gap-8">
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Recovery Stats</h2>
            <ul className="space-y-2">
              <li>Average Recovery Rate: 28.3%</li>
              <li>Revenue Recovered: $42M+</li>
              <li>Stores Using: 2,847</li>
              <li>Avg. Time to Convert: 3.2hrs</li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
            <ul className="space-y-2">
              <li>✓ Send Within 1 Hour</li>
              <li>✓ Include Product Images</li>
              <li>✓ Add Urgency</li>
              <li>✓ Personalize Subject Lines</li>
              <li>✓ Mobile Optimize</li>
              <li>✓ A/B Test Everything</li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">3-Email Sequence</h2>
            <ul className="space-y-2">
              <li>Email 1 (1 Hour): Gentle Reminder - 47% open rate</li>
              <li>Email 2 (24 Hours): Add Incentive - 39% open rate</li>
              <li>Email 3 (72 Hours): Create Urgency - 31% open rate</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}