import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, CheckCircle, ShoppingCart, Mail, TrendingUp, Users } from 'lucide-react';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

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

const templates = [
  {
    name: 'Abandoned Cart Recovery',
    description: 'Recover lost sales with urgency-driven templates',
    icon: ShoppingCart,
    stats: '28.3% recovery rate',
    features: ['Product images', 'Discount codes', 'Urgency timers'],
  },
  {
    name: 'Welcome Series',
    description: 'Turn subscribers into loyal customers',
    icon: Mail,
    stats: '3.2x engagement',
    features: ['Brand storytelling', 'First-purchase discount', 'Social proof'],
  },
  {
    name: 'Product Launch',
    description: 'Create buzz and drive early sales',
    icon: TrendingUp,
    stats: '47% open rate',
    features: ['Countdown timers', 'VIP early access', 'Social sharing'],
  },
  {
    name: 'Customer Win-Back',
    description: 'Re-engage dormant customers',
    icon: Users,
    stats: '19% reactivation',
    features: ['Personalized offers', 'Product recommendations', 'Feedback surveys'],
  },
];

export default function ShopifyEmailTemplatesPage() {
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
              <span className="text-gray-900">Shopify Email Templates</span>
            </nav>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-6">
                  Shopify Email Templates That Actually 
                  <span className="text-primary"> Convert</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Join 2,847 Shopify stores using our proven email templates to drive 
                  <strong> $127M in attributed revenue</strong>. No design skills needed.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button size="lg" className="text-lg px-8" asChild>
                    <Link href="/templates">
                      Browse Templates
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                    <Link href="/signup">
                      Start Free Trial
                    </Link>
                  </Button>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>5 free exports/month</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <Image
                  src="/shopify-email-template-preview.png"
                  alt="Shopify email template examples showing abandoned cart and welcome emails"
                  width={600}
                  height={450}
                  className="rounded-lg shadow-2xl"
                  priority
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                  <div className="text-3xl font-bold text-primary">28.3%</div>
                  <div className="text-sm text-gray-600">Avg. Cart Recovery Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Template Categories */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Email Templates for Every Shopify Campaign
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From abandoned carts to welcome series, our templates are designed by ecommerce experts 
                and tested on thousands of Shopify stores.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {templates.map((template) => (
                <Card key={template.name} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <template.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {template.name}
                      </h3>
                      <p className="text-gray-600 mb-3">{template.description}</p>
                      <div className="text-sm font-semibold text-primary mb-3">
                        Average: {template.stats}
                      </div>
                      <ul className="space-y-1">
                        {template.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Trusted by Fast-Growing Shopify Stores
              </h2>
              <p className="text-xl text-gray-600">
                See why thousands of merchants choose ZebaMail for their email marketing
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="text-yellow-500 mb-4">★★★★★</div>
                <p className="text-gray-600 mb-4">
                  "The abandoned cart templates alone paid for our annual subscription in the first week. 
                  Incredible ROI!"
                </p>
                <div className="font-semibold">Sarah Chen</div>
                <div className="text-sm text-gray-600">Bloom Botanicals • $2.3M ARR</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-yellow-500 mb-4">★★★★★</div>
                <p className="text-gray-600 mb-4">
                  "Finally, email templates that actually look good on mobile. Our open rates 
                  increased by 34% after switching."
                </p>
                <div className="font-semibold">Marcus Rodriguez</div>
                <div className="text-sm text-gray-600">Urban Fitness Co • $890K ARR</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-yellow-500 mb-4">★★★★★</div>
                <p className="text-gray-600 mb-4">
                  "The Shopify integration is seamless. Templates automatically pull in our 
                  products and branding. Game changer!"
                </p>
                <div className="font-semibold">Emma Thompson</div>
                <div className="text-sm text-gray-600">Cozy Home Goods • $1.2M ARR</div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Shopify Email Marketing?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of successful Shopify stores. Start with our free plan today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                <Link href="/templates">
                  View All Templates
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 text-white border-white hover:bg-white hover:text-primary" asChild>
                <Link href="/signup">
                  Start Free Trial
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}