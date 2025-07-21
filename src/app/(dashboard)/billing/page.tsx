'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard,
  Bell,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { ZebCharacter, StripePattern } from '@/components/brand';

export const dynamic = 'force-dynamic';

const plans = [
  {
    name: 'Free',
    price: 0,
    features: [
      '5 exports per month',
      'Basic templates',
      'Standard support',
    ],
  },
  {
    name: 'Pro',
    price: 29,
    features: [
      'Unlimited exports',
      'All premium templates',
      'Priority support',
      'No watermarks',
    ],
    popular: true,
  },
  {
    name: 'Agency',
    price: 49,
    features: [
      'Everything in Pro',
      'White-label exports',
      'Client management',
      'Dedicated support',
    ],
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-2">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Coming Soon Overlay */}
      <div className="relative">
        {/* Fuzzed-out billing content */}
        <div className="filter blur-sm opacity-50 pointer-events-none">
          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">Current Plan</div>
                <div className="text-2xl font-bold">Free</div>
                <p className="text-xs text-gray-500 mt-1">Free forever</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">Usage This Month</div>
                <div className="text-2xl font-bold">3/5</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">Next Billing</div>
                <div className="text-2xl font-bold">Never</div>
                <p className="text-xs text-gray-500 mt-1">Free plan</p>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.popular ? 'border-blue-500 shadow-lg' : ''}>
                <CardContent className="p-6">
                  {plan.popular && (
                    <Badge className="mb-4 bg-blue-500 text-white">Most Popular</Badge>
                  )}
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-4">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-600">/month</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.name === 'Free' ? 'secondary' : 'default'}>
                    {plan.name === 'Free' ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
                Billing Coming Soon!
              </h2>
              
              <p className="text-lg text-gray-700 mb-8">
                We're setting up our billing system to give you the best value. 
                Beta testers enjoy unlimited access during the beta period!
              </p>
              
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-growth-green/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-growth-green mr-3" />
                  <span className="text-lg font-semibold text-gray-800">
                    Free unlimited access during beta
                  </span>
                </div>
                
                <Link href="/signup">
                  <Button className="bg-growth-green hover:bg-growth-green-600 text-white px-8 py-3 text-lg">
                    <Bell className="w-5 h-5 mr-2" />
                    Get Notified When Live
                  </Button>
                </Link>
                
                <p className="text-sm text-gray-600 mt-4">
                  Beta users will receive <span className="font-semibold text-growth-green">50% off</span> for life!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}