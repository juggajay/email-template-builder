import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Clock, DollarSign, ShoppingCart, TrendingUp, Zap, Mail } from 'lucide-react';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

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

const stats = [
  { label: 'Average Recovery Rate', value: '28.3%', icon: TrendingUp },
  { label: 'Revenue Recovered', value: '$42M+', icon: DollarSign },
  { label: 'Stores Using', value: '2,847', icon: ShoppingCart },
  { label: 'Avg. Time to Convert', value: '3.2hrs', icon: Clock },
];

const bestPractices = [
  {
    title: 'Send Within 1 Hour',
    description: '70% of cart recoveries happen within the first hour. Our templates trigger automatically.',
  },
  {
    title: 'Include Product Images',
    description: 'Emails with product images have 42% higher click rates. All templates include dynamic images.',
  },
  {
    title: 'Add Urgency',
    description: 'Limited-time offers increase conversions by 27%. Use countdown timers and stock alerts.',
  },
  {
    title: 'Personalize Subject Lines',
    description: 'Personalized subjects get 26% more opens. Use customer name and cart value.',
  },
  {
    title: 'Mobile Optimize',
    description: '67% of emails are opened on mobile. Our templates are fully responsive.',
  },
  {
    title: 'A/B Test Everything',
    description: 'Top performers test subject lines, timing, and offers. Built-in A/B testing included.',
  },
];

export default function AbandonedCartTemplatesPage() {
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
              <Link href="/shopify-email-templates" className="hover:text-primary">Email Templates</Link>
              <span>/</span>
              <span className="text-gray-900">Abandoned Cart Templates</span>
            </nav>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Zap className="h-4 w-4" />
                  $7 Billion Lost to Cart Abandonment Yearly
                </div>
                
                <h1 className="text-5xl font-bold text-gray-900 mb-6">
                  Abandoned Cart Email Templates That 
                  <span className="text-primary"> Recover Revenue</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Stop losing sales to abandoned carts. Our proven templates recover an average of 
                  <strong> 28.3% of abandoned carts</strong> within 24 hours.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button size="lg" className="text-lg px-8" asChild>
                    <Link href="/templates?category=abandoned-cart">
                      Get Templates Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                    <Link href="/editor?template=abandoned-cart">
                      Try Template Editor
                    </Link>
                  </Button>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Free templates included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Works with Shopify</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <Image
                  src="/abandoned-cart-email-example.png"
                  alt="Abandoned cart email template example showing product reminder with discount code"
                  width={600}
                  height={500}
                  className="rounded-lg shadow-2xl"
                  priority
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-lg shadow-lg max-w-xs">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">$127M</div>
                      <div className="text-sm text-gray-600">Revenue Recovered</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Template Examples */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                3-Email Sequence That Converts
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our data shows a 3-email sequence recovers 75% more carts than a single email. 
                Here's the proven formula:
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="text-sm font-semibold text-primary mb-2">Email 1 - 1 Hour</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Gentle Reminder
                </h3>
                <p className="text-gray-600 mb-4">
                  "You left something behind" - A friendly reminder with product images and 
                  a clear CTA to complete purchase.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>47% open rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>21% click rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>15% conversion</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-sm font-semibold text-primary mb-2">Email 2 - 24 Hours</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Add Incentive
                </h3>
                <p className="text-gray-600 mb-4">
                  "Still thinking it over?" - Include a 10% discount or free shipping 
                  to overcome purchase hesitation.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>39% open rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>18% click rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>12% conversion</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-sm font-semibold text-primary mb-2">Email 3 - 72 Hours</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Create Urgency
                </h3>
                <p className="text-gray-600 mb-4">
                  "Last chance!" - Cart expires soon message with countdown timer 
                  and social proof.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>31% open rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>14% click rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>8% conversion</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Abandoned Cart Email Best Practices
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Follow these proven strategies to maximize your cart recovery rate
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestPractices.map((practice, index) => (
                <Card key={index} className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {practice.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {practice.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-white">
              <div className="text-yellow-500 text-2xl mb-4">★★★★★</div>
              <blockquote className="text-2xl text-gray-900 mb-6">
                "We recovered $47,000 in abandoned carts in our first month using ZebaMail's templates. 
                The ROI is insane - it paid for itself in the first 3 days."
              </blockquote>
              <div className="flex items-center gap-4">
                <Image
                  src="/testimonial-avatar-1.jpg"
                  alt="Jake Martinez"
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div>
                  <div className="font-semibold text-gray-900">Jake Martinez</div>
                  <div className="text-gray-600">Founder, TechGear Pro • $3.2M Annual Revenue</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">
              Start Recovering Lost Revenue Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join 2,847 Shopify stores recovering millions in abandoned carts
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                <Link href="/templates?category=abandoned-cart">
                  Get Abandoned Cart Templates
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 text-white border-white hover:bg-white hover:text-primary" asChild>
                <Link href="/signup">
                  Start Free Trial
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm opacity-80">
              Free plan includes 5 exports/month • No credit card required
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}