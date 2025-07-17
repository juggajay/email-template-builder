'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';

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

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

            <Link href={plan.href}>
              <Button
                className="w-full"
                variant={plan.highlighted ? 'default' : 'outline'}
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto text-left space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
            <p className="text-gray-600">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600">
              We accept all major credit cards through Stripe. Agency plans can also pay by invoice.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-gray-600">
              Yes! Pro and Agency plans come with a 14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}