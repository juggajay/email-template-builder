'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { 
  Crown, 
  Zap, 
  Check, 
  X,
  CreditCard,
  Calendar,
  TrendingUp,
  Shield,
  Star,
  Download
} from 'lucide-react';
import { getStripe } from '@/lib/stripe/client';

export const dynamic = 'force-dynamic';

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for trying out our platform',
    features: [
      '5 exports per month',
      'Basic templates',
      'Standard support',
      'Watermark on exports',
    ],
    limitations: [
      'Limited templates',
      'No priority support',
      'Basic analytics',
    ],
    cta: 'Current Plan',
    priceId: null,
  },
  {
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'For growing businesses',
    features: [
      'Unlimited exports',
      'All premium templates',
      'Priority support',
      'No watermarks',
      'Advanced analytics',
      'Team collaboration',
    ],
    limitations: [],
    cta: 'Upgrade to Pro',
    priceId: 'price_pro_monthly',
    popular: true,
  },
  {
    name: 'Agency',
    price: 49,
    period: 'month',
    description: 'For agencies and large teams',
    features: [
      'Everything in Pro',
      'White-label exports',
      'Client management',
      'Custom branding',
      'Advanced integrations',
      'Dedicated support',
    ],
    limitations: [],
    cta: 'Upgrade to Agency',
    priceId: 'price_agency_monthly',
  },
];

export default function BillingPage() {
  const { user, profile, subscription, isPro, isAgency } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingPortalLoading, setBillingPortalLoading] = useState(false);

  const handleUpgrade = async (priceId: string) => {
    if (!user) return;

    setLoading(priceId);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      });

      const { sessionId } = await response.json();
      
      const stripe = await getStripe();
      const { error } = await stripe!.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error('Stripe checkout error:', error);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    if (!user || !profile?.stripe_customer_id) return;

    setBillingPortalLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: profile.stripe_customer_id,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
    } finally {
      setBillingPortalLoading(false);
    }
  };

  const getCurrentPlan = () => {
    if (isAgency) return 'Agency';
    if (isPro) return 'Pro';
    return 'Free';
  };

  const getUsageStats = () => {
    const usageCount = profile?.usage_count || 0;
    const maxExports = subscription?.plan === 'free' ? 5 : Infinity;
    const percentage = subscription?.plan === 'free' ? (usageCount / 5) * 100 : 0;

    return {
      used: usageCount,
      total: maxExports,
      percentage: Math.min(percentage, 100),
    };
  };

  const usage = getUsageStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription and billing information
          </p>
        </div>
        
        {(isPro || isAgency) && (
          <Button
            variant="outline"
            onClick={handleManageBilling}
            loading={billingPortalLoading}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Manage Billing
          </Button>
        )}
      </div>

      {/* Current plan status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            {isAgency ? (
              <Crown className="h-4 w-4 text-yellow-500" />
            ) : isPro ? (
              <Zap className="h-4 w-4 text-blue-500" />
            ) : (
              <Star className="h-4 w-4 text-gray-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCurrentPlan()}</div>
            <p className="text-xs text-muted-foreground">
              {subscription?.plan === 'free' ? 'Free forever' : `$${subscription?.plan === 'pro' ? '29' : '49'}/month`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage This Month</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usage.used}{subscription?.plan === 'free' ? `/5` : ''}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${subscription?.plan === 'free' ? usage.percentage : 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {subscription?.plan === 'free' ? 'Exports used' : 'Unlimited exports'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription?.plan === 'free' ? 'Never' : 'Jan 1, 2024'}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription?.plan === 'free' ? 'Free plan' : 'Auto-renewal'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing plans */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
          <p className="text-gray-600 mt-2">
            Upgrade anytime to unlock more features and templates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative ${
                plan.popular 
                  ? 'border-blue-500 shadow-lg scale-105' 
                  : subscription?.plan === plan.name.toLowerCase() 
                    ? 'border-green-500' 
                    : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
              )}
              
              {subscription?.plan === plan.name.toLowerCase() && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white">Current Plan</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-gray-600">
                    /{plan.period}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center">
                      <X className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full"
                  variant={subscription?.plan === plan.name.toLowerCase() ? 'secondary' : 'default'}
                  disabled={subscription?.plan === plan.name.toLowerCase() || loading === plan.priceId}
                  loading={loading === plan.priceId}
                  onClick={() => plan.priceId && handleUpgrade(plan.priceId)}
                >
                  {subscription?.plan === plan.name.toLowerCase() ? 'Current Plan' : plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing history */}
      {(isPro || isAgency) && (
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">December 2023</p>
                  <p className="text-sm text-gray-600">Pro Plan</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$29.00</p>
                  <Badge variant="outline">Paid</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">November 2023</p>
                  <p className="text-sm text-gray-600">Pro Plan</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$29.00</p>
                  <Badge variant="outline">Paid</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">October 2023</p>
                  <p className="text-sm text-gray-600">Pro Plan</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$29.00</p>
                  <Badge variant="outline">Paid</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Can I cancel anytime?</h4>
            <p className="text-sm text-gray-600">
              Yes, you can cancel your subscription at any time. Your plan will remain active until the end of your current billing period.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">What happens to my templates if I downgrade?</h4>
            <p className="text-sm text-gray-600">
              Your templates will remain saved, but you'll lose access to premium features and your export limit will reset to 5 per month.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Do you offer refunds?</h4>
            <p className="text-sm text-gray-600">
              We offer a 30-day money-back guarantee for new subscribers. Contact our support team for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}