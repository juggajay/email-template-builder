import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, CheckCircle, TrendingUp, BarChart3, Target, Lightbulb, Users, Zap } from 'lucide-react';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

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

const conversionStats = [
  { metric: 'Average Open Rate', value: '47.3%', benchmark: '21.5%', improvement: '+119%' },
  { metric: 'Click-Through Rate', value: '18.7%', benchmark: '7.8%', improvement: '+139%' },
  { metric: 'Conversion Rate', value: '5.2%', benchmark: '1.9%', improvement: '+173%' },
  { metric: 'Revenue per Email', value: '$1.78', benchmark: '$0.52', improvement: '+242%' },
];

const templateTypes = [
  {
    category: 'Welcome Series',
    icon: Users,
    conversionRate: '8.7%',
    description: 'Turn new subscribers into first-time buyers',
    tips: [
      'Send within 1 hour of signup',
      'Include 10-15% first-purchase discount',
      'Showcase bestsellers',
      'Add social proof',
    ],
  },
  {
    category: 'Product Launch',
    icon: Zap,
    conversionRate: '6.3%',
    description: 'Create buzz and drive early sales',
    tips: [
      'Build anticipation with teasers',
      'Offer exclusive early access',
      'Use countdown timers',
      'Include user-generated content',
    ],
  },
  {
    category: 'Re-engagement',
    icon: Target,
    conversionRate: '4.8%',
    description: 'Win back inactive customers',
    tips: [
      'Segment by purchase history',
      'Offer compelling incentives',
      'Show what they\'re missing',
      'Create FOMO with limited offers',
    ],
  },
  {
    category: 'Post-Purchase',
    icon: BarChart3,
    conversionRate: '7.2%',
    description: 'Drive repeat purchases and reviews',
    tips: [
      'Request reviews after delivery',
      'Suggest complementary products',
      'Offer loyalty rewards',
      'Share care instructions',
    ],
  },
];

const conversionPrinciples = [
  {
    principle: 'Mobile-First Design',
    description: '67% of emails are opened on mobile. Our templates are optimized for small screens.',
    impact: '+42% mobile conversions',
  },
  {
    principle: 'Clear Value Proposition',
    description: 'Lead with benefits, not features. Tell customers what\'s in it for them.',
    impact: '+31% click-through rate',
  },
  {
    principle: 'Single Call-to-Action',
    description: 'One clear CTA performs 371% better than emails with multiple CTAs.',
    impact: '+28% conversion rate',
  },
  {
    principle: 'Personalization at Scale',
    description: 'Use dynamic content to personalize product recommendations and offers.',
    impact: '+26% revenue per email',
  },
  {
    principle: 'Social Proof',
    description: 'Include reviews, testimonials, and purchase numbers to build trust.',
    impact: '+18% purchase rate',
  },
  {
    principle: 'Urgency & Scarcity',
    description: 'Limited-time offers and stock alerts create action-driving urgency.',
    impact: '+37% same-day purchases',
  },
];

export default function EmailTemplatesThatConvertPage() {
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
              <span className="text-gray-900">Email Templates That Convert</span>
            </nav>
            
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <TrendingUp className="h-4 w-4" />
                Based on 127M Emails Sent
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Email Templates That Actually
                <span className="text-primary"> Convert Browsers to Buyers</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Stop guessing what works. Use proven email templates that drive an average 
                <strong> 34% increase in sales</strong> for ecommerce stores.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" className="text-lg px-8" asChild>
                  <Link href="/templates">
                    Browse High-Converting Templates
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                  <Link href="/signup">
                    Start Free Trial
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Stats */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Templates vs. Industry Average
              </h2>
              <p className="text-xl text-gray-600">
                Real performance data from 2,847 stores using our templates
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {conversionStats.map((stat) => (
                <Card key={stat.metric} className="p-6 text-center">
                  <div className="text-sm text-gray-600 mb-2">{stat.metric}</div>
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500 mb-2">vs {stat.benchmark} average</div>
                  <div className="text-lg font-semibold text-green-600">{stat.improvement}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Template Categories */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                High-Converting Templates by Category
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Each template type is optimized for its specific goal, with proven elements that drive action
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {templateTypes.map((type) => (
                <Card key={type.category} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <type.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {type.category}
                        </h3>
                        <span className="text-sm font-semibold text-primary">
                          {type.conversionRate} avg conversion
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{type.description}</p>
                      <div className="space-y-2">
                        {type.tips.map((tip, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Conversion Principles */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                6 Principles of High-Converting Email Design
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Every template follows these data-backed principles for maximum conversions
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {conversionPrinciples.map((item, index) => (
                <Card key={index} className="p-6">
                  <Lightbulb className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.principle}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {item.description}
                  </p>
                  <div className="text-sm font-semibold text-green-600">
                    {item.impact}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Case Study */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-sm font-semibold text-primary mb-2">CASE STUDY</div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  How Luxe Beauty Increased Email Revenue by 342%
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  By switching to our high-converting templates, Luxe Beauty transformed their 
                  email marketing from an afterthought to their #1 revenue channel.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-primary">342%</div>
                    <div className="text-gray-600">increase in email revenue</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-primary">67%</div>
                    <div className="text-gray-600">higher open rates</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-primary">$487K</div>
                    <div className="text-gray-600">additional revenue in 6 months</div>
                  </div>
                </div>
                
                <Button size="lg" asChild>
                  <Link href="/case-studies/luxe-beauty">
                    Read Full Case Study
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              
              <div className="relative">
                <Image
                  src="/case-study-luxe-beauty.png"
                  alt="Luxe Beauty email performance dashboard showing 342% revenue increase"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Boost Your Email Conversions?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of stores using our proven templates to drive more sales
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                <Link href="/templates">
                  Get High-Converting Templates
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
              Average ROI: 42:1 • Free plan available • No credit card required
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}