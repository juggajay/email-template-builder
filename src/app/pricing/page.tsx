'use client';

import { Button } from '@/components/ui/button';
import { Check, Bell } from 'lucide-react';
import Link from 'next/link';
import { ZebCharacter, StripePattern } from '@/components/brand';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out our email builder',
    features: [
      '5 templates per month',
      'Basic email components',
      'HTML export only',
      'Community support',
      'Watermark on exports'
    ],
    cta: 'Get Started',
    href: '/signup',
    highlighted: false
  },
  {
    name: 'Pro',
    price: '$29',
    description: 'For professionals and small businesses',
    features: [
      'Unlimited templates',
      'All email components',
      'All export formats',
      'Priority support',
      'No watermark',
      'Custom branding',
      'Analytics dashboard'
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=pro',
    highlighted: true
  },
  {
    name: 'Agency',
    price: '$99',
    description: 'For agencies and large teams',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'White-label options',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'Training sessions'
    ],
    cta: 'Contact Sales',
    href: '/contact',
    highlighted: false
  }
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600">
          Choose the plan that fits your needs. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Coming Soon Overlay */}
      <div className="relative">
        {/* Fuzzed-out pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto filter blur-sm opacity-50 pointer-events-none">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg p-8 ${
                plan.highlighted
                  ? 'border-2 border-primary shadow-xl scale-105'
                  : 'border border-gray-200'
              }`}
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== '$0' && <span className="text-gray-600">/month</span>}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.highlighted ? 'default' : 'outline'}
                disabled
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl mx-4 text-center border-2 border-growth-green relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <StripePattern animation="static" opacity={0.1} color="#00d4aa" />
            </div>
            
            <div className="relative z-10">
              <ZebCharacter variant="celebrate" size="lg" className="mx-auto mb-6" />
              
              <h2 className="text-3xl font-bold text-zebra-black mb-4">
                Pricing Coming Soon!
              </h2>
              
              <p className="text-lg text-gray-700 mb-8">
                We're finalizing our pricing plans to give you the best value. 
                Join our beta program to get early access and special launch pricing!
              </p>
              
              <div className="space-y-4">
                <Link href="/signup">
                  <Button className="bg-growth-green hover:bg-growth-green-600 text-white px-8 py-3 text-lg">
                    <Bell className="w-5 h-5 mr-2" />
                    Join Beta & Get Notified
                  </Button>
                </Link>
                
                <p className="text-sm text-gray-600">
                  Beta users will receive <span className="font-semibold text-growth-green">50% off</span> for the first 6 months!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-32 text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto text-left space-y-6">
          <div>
            <h3 className="font-semibold mb-2">When will pricing be available?</h3>
            <p className="text-gray-600">
              We're launching our pricing plans in early 2025. Beta users will get exclusive early access and discounts.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How can I get early access?</h3>
            <p className="text-gray-600">
              Sign up for our beta program! You'll get immediate access to all features and special pricing when we launch.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Will there be a free plan?</h3>
            <p className="text-gray-600">
              Yes! We'll always offer a free plan for small businesses and individuals to get started with email marketing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}