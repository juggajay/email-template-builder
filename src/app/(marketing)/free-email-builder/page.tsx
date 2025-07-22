import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Sparkles, Code, Palette, Smartphone, Download, Globe } from 'lucide-react';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

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

const features = [
  {
    icon: Palette,
    title: 'Drag & Drop Editor',
    description: 'Intuitive visual editor that anyone can use. No coding or design skills needed.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Responsive',
    description: 'Every template automatically adapts to look perfect on all devices.',
  },
  {
    icon: Code,
    title: 'Clean HTML Export',
    description: 'Export email-ready HTML with inline CSS that works in all email clients.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Content',
    description: 'Generate compelling copy with our AI assistant. Never stare at a blank page.',
  },
  {
    icon: Globe,
    title: 'Works Everywhere',
    description: 'Compatible with Mailchimp, Klaviyo, Shopify Email, and 50+ platforms.',
  },
  {
    icon: Download,
    title: '5 Free Exports/Month',
    description: 'Create unlimited designs and export 5 emails free every month.',
  },
];

const comparisonData = [
  { feature: 'Drag & Drop Editor', zebamail: true, mailchimp: true, others: 'Limited' },
  { feature: 'Free Exports', zebamail: '5/month', mailchimp: '0', others: '1-2' },
  { feature: 'Shopify Integration', zebamail: true, mailchimp: false, others: false },
  { feature: 'AI Content Generation', zebamail: true, mailchimp: false, others: false },
  { feature: 'Mobile Preview', zebamail: true, mailchimp: true, others: 'Some' },
  { feature: 'No Watermarks', zebamail: true, mailchimp: false, others: false },
  { feature: 'Template Library', zebamail: '100+', mailchimp: '100+', others: '10-50' },
  { feature: 'CSS Inlining', zebamail: true, mailchimp: true, others: false },
];

export default function FreeEmailBuilderPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-6xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <span className="text-gray-900">Free Email Builder</span>
            </nav>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4" />
                  100% Free to Start • No Credit Card
                </div>
                
                <h1 className="text-5xl font-bold text-gray-900 mb-6">
                  Free Email Builder for
                  <span className="text-primary"> Modern Marketers</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Create stunning, mobile-responsive email templates in minutes with our 
                  drag-and-drop builder. <strong>No coding required.</strong> Works with 
                  all major email platforms.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button size="lg" className="text-lg px-8" asChild>
                    <Link href="/editor">
                      Start Building Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                    <Link href="/templates">
                      Browse Templates
                    </Link>
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>5 free exports/month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>No watermarks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>100+ templates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Forever free plan</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <Image
                  src="/free-email-builder-interface.png"
                  alt="Free email builder interface showing drag and drop editor"
                  width={700}
                  height={500}
                  className="rounded-lg shadow-2xl"
                  priority
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Ready in Minutes</div>
                      <div className="text-sm text-gray-600">No learning curve</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Create Beautiful Emails
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Professional features that are actually free. No hidden costs or surprise charges.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Create Your First Email in 3 Simple Steps
              </h2>
              <p className="text-xl text-gray-600">
                From idea to inbox-ready in minutes, not hours
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Choose a Template
                </h3>
                <p className="text-gray-600">
                  Start with a professionally designed template or begin from scratch
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Customize Your Design
                </h3>
                <p className="text-gray-600">
                  Drag, drop, and edit. Add your content, images, and branding
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Export & Send
                </h3>
                <p className="text-gray-600">
                  Download email-ready HTML or connect directly to your email platform
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose ZebaMail's Free Email Builder?
              </h2>
              <p className="text-xl text-gray-600">
                See how we compare to other "free" email builders
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      <div className="text-primary">ZebaMail</div>
                      <div className="text-xs font-normal text-gray-600">Free Plan</div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Mailchimp
                      <div className="text-xs font-normal text-gray-600">Free Plan</div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Others
                      <div className="text-xs font-normal text-gray-600">Average</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonData.map((row) => (
                    <tr key={row.feature}>
                      <td className="px-6 py-4 text-sm text-gray-900">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        {typeof row.zebamail === 'boolean' ? (
                          row.zebamail ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-gray-400">✕</span>
                          )
                        ) : (
                          <span className="text-sm font-semibold text-primary">{row.zebamail}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof row.mailchimp === 'boolean' ? (
                          row.mailchimp ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-gray-400">✕</span>
                          )
                        ) : (
                          <span className="text-sm text-gray-600">{row.mailchimp}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof row.others === 'boolean' ? (
                          row.others ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-gray-400">✕</span>
                          )
                        ) : (
                          <span className="text-sm text-gray-600">{row.others}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-white">
              <div className="text-yellow-500 text-2xl mb-4">★★★★★</div>
              <blockquote className="text-2xl text-gray-900 mb-6">
                "I was paying $99/month for another email builder. ZebaMail's free plan 
                does everything I need. The templates are more modern and the editor is 
                actually easier to use."
              </blockquote>
              <div className="flex items-center gap-4">
                <Image
                  src="/testimonial-avatar-2.jpg"
                  alt="Lisa Park"
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div>
                  <div className="font-semibold text-gray-900">Lisa Park</div>
                  <div className="text-gray-600">Founder, Mindful Living Co • 47K Subscribers</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">
              Start Creating Beautiful Emails for Free
            </h2>
            <p className="text-xl mb-8 opacity-90">
              No credit card. No time limits. Just a powerful email builder that's actually free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                <Link href="/editor">
                  Open Free Email Builder
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 text-white border-white hover:bg-white hover:text-primary" asChild>
                <Link href="/templates">
                  Browse Free Templates
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm opacity-80">
              Join 127,000+ marketers creating better emails with ZebaMail
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}