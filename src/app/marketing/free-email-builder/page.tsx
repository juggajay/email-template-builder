import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Email Builder | Create Professional Emails Without Code - ZebaMail',
  description: 'Free drag-and-drop email builder. Create stunning, mobile-responsive email templates in minutes. No coding required. 5 free exports per month.',
  keywords: 'free email builder, drag and drop email builder, email template builder free, email designer, free email creator, html email builder',
  openGraph: {
    title: 'Free Email Builder - No Code Required | ZebaMail',
    description: 'Create beautiful email templates with our free drag-and-drop builder. 5 free exports monthly.',
    images: ['/og-free-builder.png'],
  },
};

export default function FreeEmailBuilderPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Free Email Builder for Modern Marketers
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Create stunning, mobile-responsive email templates in minutes with our drag-and-drop builder. No coding required. Works with all major email platforms.
        </p>
        
        <div className="grid gap-8">
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Key Features</h2>
            <ul className="space-y-2">
              <li>✓ Drag & Drop Editor</li>
              <li>✓ Mobile Responsive</li>
              <li>✓ Clean HTML Export</li>
              <li>✓ AI-Powered Content</li>
              <li>✓ Works Everywhere</li>
              <li>✓ 5 Free Exports/Month</li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Why Choose ZebaMail?</h2>
            <p>Professional features that are actually free. No hidden costs or surprise charges.</p>
            <p className="text-primary font-semibold mt-4">Join 127,000+ marketers creating better emails with ZebaMail</p>
          </div>
        </div>
      </div>
    </main>
  );
}