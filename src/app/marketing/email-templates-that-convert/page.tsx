import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Templates That Convert | Proven Designs That Drive Sales - ZebaMail',
  description: 'Discover email templates with proven conversion rates. Based on 127M emails sent, these templates drive an average 34% increase in sales for ecommerce stores.',
  keywords: 'email templates that convert, high converting email templates, email conversion optimization, ecommerce email templates, email marketing templates',
  openGraph: {
    title: 'Email Templates That Convert | 34% Sales Increase - ZebaMail',
    description: 'Proven email templates based on 127M emails sent. Drive more sales with templates that convert.',
    images: ['/og-converting-templates.png'],
  },
};

export default function EmailTemplatesThatConvertPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Email Templates That Actually Convert Browsers to Buyers
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Stop guessing what works. Use proven email templates that drive an average 34% increase in sales for ecommerce stores.
        </p>
        
        <div className="grid gap-8">
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Performance Stats</h2>
            <ul className="space-y-2">
              <li>Average Open Rate: 47.3% (+119% vs industry)</li>
              <li>Click-Through Rate: 18.7% (+139% vs industry)</li>
              <li>Conversion Rate: 5.2% (+173% vs industry)</li>
              <li>Revenue per Email: $1.78 (+242% vs industry)</li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Conversion Principles</h2>
            <ul className="space-y-2">
              <li>✓ Mobile-First Design</li>
              <li>✓ Clear Value Proposition</li>
              <li>✓ Single Call-to-Action</li>
              <li>✓ Personalization at Scale</li>
              <li>✓ Social Proof</li>
              <li>✓ Urgency & Scarcity</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}