# Stripe Integration Research Overview

## Table of Contents
1. [Overview](#overview)
2. [Stripe Elements & Payment UI](#stripe-elements--payment-ui)
3. [Subscription Management](#subscription-management)
4. [Webhook Handling](#webhook-handling)
5. [Customer Portal](#customer-portal)
6. [Pricing Table Implementation](#pricing-table-implementation)
7. [Next.js Integration Patterns](#nextjs-integration-patterns)
8. [Implementing Freemium Model](#implementing-freemium-model)

## Overview

This document provides comprehensive research on implementing Stripe for a freemium SaaS model with subscription tiers ranging from $29-49/month. All information is based on official Stripe documentation.

## Stripe Elements & Payment UI

### What is Stripe Elements?
Stripe Elements is a set of prebuilt UI components that securely collect payment information without exposing sensitive data to your servers.

### Key Features
- **Global Payment Methods**: Supports 100+ payment methods including cards, wallets (Apple Pay, Google Pay), and regional payment methods
- **Built-in Compliance**: Handles global compliance requirements automatically
- **Customizable UI**: Full control over appearance to match your brand
- **Secure by Design**: Payment details are tokenized and never touch your server

### Implementation with Payment Element

```javascript
// Initialize Stripe
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');

// Checkout Form Component
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'https://example.com/order/complete',
      },
    });

    if (result.error) {
      // Show error to customer
      console.log(result.error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe}>Submit</button>
    </form>
  );
}

// App Component
function App() {
  const options = {
    clientSecret: 'CLIENT_SECRET_FROM_BACKEND',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0570de',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'Ideal Sans, system-ui, sans-serif',
        spacingUnit: '2px',
        borderRadius: '4px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
}
```

### Best Practices
1. Use Payment Element for maximum payment method coverage
2. Implement Express Checkout Element for one-click payments
3. Always use HTTPS in production
4. Handle loading states gracefully
5. Provide clear error messages

## Subscription Management

### Core Concepts

#### Subscription Lifecycle
1. **Trialing**: Free trial period before first payment
2. **Incomplete**: Initial payment pending or requires authentication
3. **Active**: Subscription in good standing
4. **Past Due**: Payment failed but subscription continues
5. **Canceled**: Subscription terminated
6. **Unpaid**: Latest invoice unpaid

### Implementation Steps

#### 1. Create Products and Prices
```javascript
// Server-side: Create product and pricing
const product = await stripe.products.create({
  name: 'Pro Plan',
  description: 'Advanced features for growing teams',
});

const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 2900, // $29.00
  currency: 'usd',
  recurring: {
    interval: 'month',
  },
});
```

#### 2. Create Subscription with Checkout
```javascript
// Server-side: Create Checkout Session for subscription
app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price: 'price_1234567890', // Your price ID
        quantity: 1,
      },
    ],
    success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://example.com/cancel',
    // Enable Customer Portal for subscription management
    subscription_data: {
      metadata: {
        user_id: req.user.id,
      },
    },
  });

  res.json({ url: session.url });
});
```

#### 3. Handle Subscription States
```javascript
// Webhook handler for subscription events
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':
      // New subscription created
      await provisionAccess(event.data.object);
      break;
      
    case 'customer.subscription.updated':
      // Handle plan changes, status updates
      await updateAccess(event.data.object);
      break;
      
    case 'customer.subscription.deleted':
      // Remove access
      await revokeAccess(event.data.object);
      break;
      
    case 'invoice.payment_succeeded':
      // Payment successful, ensure access is active
      break;
      
    case 'invoice.payment_failed':
      // Handle failed payment
      await notifyCustomerPaymentFailed(event.data.object);
      break;
  }

  res.json({ received: true });
});
```

### Managing Upgrades/Downgrades

```javascript
// Update subscription to new price
async function changeSubscriptionPlan(subscriptionId, newPriceId) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations', // or 'none' to disable prorations
  });
  
  return updatedSubscription;
}
```

### Free Trial Implementation

```javascript
// Create subscription with free trial
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  trial_period_days: 14,
  payment_behavior: 'default_incomplete',
  payment_settings: {
    save_default_payment_method: 'on_subscription',
  },
  expand: ['latest_invoice.payment_intent'],
});
```

## Webhook Handling

### Security Best Practices

```javascript
// Express webhook endpoint with signature verification
const express = require('express');
const stripe = require('stripe')('sk_test_...');

const endpointSecret = 'whsec_...';

app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event asynchronously
  setImmediate(async () => {
    try {
      await handleWebhookEvent(event);
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  });

  // Return a response to acknowledge receipt of the event
  res.json({received: true});
});
```

### Essential Subscription Events

```javascript
async function handleWebhookEvent(event) {
  switch (event.type) {
    // Subscription lifecycle events
    case 'customer.subscription.created':
      console.log('New subscription:', event.data.object.id);
      await handleNewSubscription(event.data.object);
      break;

    case 'customer.subscription.updated':
      console.log('Subscription updated:', event.data.object.id);
      await handleSubscriptionUpdate(event.data.object);
      break;

    case 'customer.subscription.deleted':
      console.log('Subscription canceled:', event.data.object.id);
      await handleSubscriptionCancellation(event.data.object);
      break;

    // Payment events
    case 'invoice.paid':
      console.log('Invoice paid:', event.data.object.id);
      await handleSuccessfulPayment(event.data.object);
      break;

    case 'invoice.payment_failed':
      console.log('Invoice payment failed:', event.data.object.id);
      await handleFailedPayment(event.data.object);
      break;

    // Customer events
    case 'customer.updated':
      console.log('Customer updated:', event.data.object.id);
      await updateCustomerInfo(event.data.object);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
}
```

### Webhook Testing with Stripe CLI

```bash
# Install Stripe CLI
# Forward events to your local endpoint
stripe listen --forward-to localhost:3000/webhook

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

## Customer Portal

### Features
- Self-service subscription management
- Update payment methods
- Download invoices
- Cancel or pause subscriptions
- Change plans (with restrictions)

### Setup and Configuration

```javascript
// Create a portal session
app.post('/create-portal-session', async (req, res) => {
  // Authenticate your user
  const customerId = req.user.stripeCustomerId;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: 'https://example.com/account',
  });

  res.redirect(session.url);
});
```

### Configuration via Dashboard
1. Navigate to Settings → Billing → Customer portal
2. Configure available features:
   - Invoice history
   - Payment method updates
   - Subscription cancellation options
   - Plan switching rules
3. Customize branding and colors
4. Set business information

### Limitations
- Cannot modify subscriptions with multiple products
- Cannot handle usage-based billing modifications
- Maximum 10 products for plan switching
- No iframe embedding support

### React Component Integration

```javascript
function AccountPage() {
  const [loading, setLoading] = useState(false);

  const handlePortalAccess = async () => {
    setLoading(true);
    try {
      const response = await fetch('/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Manage Your Subscription</h2>
      <button onClick={handlePortalAccess} disabled={loading}>
        {loading ? 'Loading...' : 'Manage Billing'}
      </button>
    </div>
  );
}
```

## Pricing Table Implementation

### Overview
Stripe Pricing Tables provide a no-code solution for displaying and selling subscription plans.

### Features
- Display up to 4 products per interval
- Support for monthly/annual billing toggles
- Built-in checkout flow
- Customizable styling
- Free trial support

### Implementation

#### 1. Create Pricing Table in Dashboard
1. Go to Product catalog → Pricing tables
2. Click "Create pricing table"
3. Add your products (Basic, Pro, Enterprise)
4. Configure display settings
5. Set payment collection settings

#### 2. Embed in Your Application

##### HTML Implementation
```html
<script async src="https://js.stripe.com/v3/pricing-table.js"></script>
<stripe-pricing-table 
  pricing-table-id="prctbl_1234567890"
  publishable-key="pk_test_51234567890">
</stripe-pricing-table>
```

##### React Implementation
```javascript
// In your index.html or _document.js (Next.js)
<script async src="https://js.stripe.com/v3/pricing-table.js"></script>

// In your React component
function PricingPage() {
  useEffect(() => {
    // Ensure the pricing table script is loaded
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <h1>Choose Your Plan</h1>
      <stripe-pricing-table 
        pricing-table-id="prctbl_1234567890"
        publishable-key="pk_test_51234567890">
      </stripe-pricing-table>
    </div>
  );
}
```

### Customization Options
- Custom CSS variables for styling
- Marketing feature bullets
- Custom call-to-action text
- Currency localization
- Free trial configuration

### Limitations
- Maximum 4 products
- Maximum 3 prices per product
- No usage-based pricing support
- 50 read operations/second rate limit

## Next.js Integration Patterns

### Project Structure
```
/app
  /api
    /stripe
      /create-checkout-session
        route.ts
      /webhook
        route.ts
      /create-portal-session
        route.ts
  /checkout
    page.tsx
  /pricing
    page.tsx
  /account
    page.tsx
/lib
  stripe.ts
  stripe-client.ts
/components
  CheckoutForm.tsx
  PricingTable.tsx
  SubscriptionManager.tsx
```

### Server-Side Setup (App Router)

#### Stripe Initialization (`/lib/stripe.ts`)
```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});
```

#### API Routes (App Router)

##### Create Checkout Session (`/app/api/stripe/create-checkout-session/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await req.json();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/account?success=true`,
      cancel_url: `${req.headers.get('origin')}/pricing?canceled=true`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

##### Webhook Handler (`/app/api/stripe/webhook/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(deletedSubscription);
        break;

      case 'invoice.payment_failed':
        const invoice = event.data.object as Stripe.Invoice;
        await handleFailedPayment(invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Webhook handler functions
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // Provision access to your service
  const userId = session.metadata?.userId;
  const subscriptionId = session.subscription as string;
  
  // Update user record with subscription info
  await updateUserSubscription(userId, subscriptionId);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  // Handle plan changes, status updates
  const userId = subscription.metadata?.userId;
  await updateUserSubscriptionStatus(userId, subscription);
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  // Revoke access
  const userId = subscription.metadata?.userId;
  await revokeUserAccess(userId);
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  // Send payment failed email
  const customerId = invoice.customer as string;
  await sendPaymentFailedEmail(customerId);
}
```

### Client-Side Components

#### Checkout Form Component
```typescript
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  features: string[];
}

export default function PricingPlans() {
  const [loading, setLoading] = useState<string | null>(null);

  const plans: PricingPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      priceId: 'price_basic_monthly',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 49,
      priceId: 'price_pro_monthly',
      features: ['All Basic features', 'Feature 4', 'Feature 5', 'Feature 6'],
    },
  ];

  const handleSubscribe = async (priceId: string) => {
    setLoading(priceId);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Stripe checkout error:', error);
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="pricing-container">
      {plans.map((plan) => (
        <div key={plan.id} className="pricing-card">
          <h3>{plan.name}</h3>
          <p className="price">${plan.price}/month</p>
          <ul>
            {plan.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          <button
            onClick={() => handleSubscribe(plan.priceId)}
            disabled={loading === plan.priceId}
          >
            {loading === plan.priceId ? 'Loading...' : 'Subscribe'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

#### Subscription Management Component
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  plan: {
    name: string;
    amount: number;
    interval: string;
  };
}

export default function SubscriptionManager() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!subscription) {
    return (
      <div>
        <p>No active subscription</p>
        <button onClick={() => router.push('/pricing')}>
          View Plans
        </button>
      </div>
    );
  }

  return (
    <div className="subscription-info">
      <h2>Your Subscription</h2>
      <div>
        <p>Plan: {subscription.plan.name}</p>
        <p>Status: {subscription.status}</p>
        <p>
          Amount: ${subscription.plan.amount / 100}/{subscription.plan.interval}
        </p>
        <p>
          Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
        </p>
        {subscription.cancelAtPeriodEnd && (
          <p className="warning">
            Your subscription will be canceled at the end of the current period
          </p>
        )}
      </div>
      <button onClick={handleManageBilling}>
        Manage Billing
      </button>
    </div>
  );
}
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Middleware for Protected Routes

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const isAuthenticated = !!token;

  const protectedPaths = ['/account', '/dashboard'];
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Check subscription status for premium features
  if (req.nextUrl.pathname.startsWith('/premium')) {
    // Verify subscription status
    // Redirect to pricing if not subscribed
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/dashboard/:path*', '/premium/:path*'],
};
```

## Implementing Freemium Model

### Strategy for $29-49/month Plans

#### 1. Plan Structure
```javascript
const subscriptionPlans = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '5 projects',
      'Basic features',
      'Community support',
    ],
    limits: {
      projects: 5,
      storage: '1GB',
      apiCalls: 1000,
    },
  },
  basic: {
    name: 'Basic',
    price: 29,
    priceId: 'price_basic_monthly',
    features: [
      'Unlimited projects',
      'Advanced features',
      'Email support',
      '10GB storage',
    ],
    limits: {
      projects: -1, // unlimited
      storage: '10GB',
      apiCalls: 10000,
    },
  },
  pro: {
    name: 'Pro',
    price: 49,
    priceId: 'price_pro_monthly',
    features: [
      'Everything in Basic',
      'Priority support',
      'Advanced analytics',
      '100GB storage',
      'API access',
    ],
    limits: {
      projects: -1,
      storage: '100GB',
      apiCalls: 100000,
    },
  },
};
```

#### 2. Feature Gating Implementation

```typescript
// Feature access control
export function hasFeatureAccess(
  userPlan: string,
  feature: string
): boolean {
  const featureMatrix = {
    basic_features: ['free', 'basic', 'pro'],
    advanced_features: ['basic', 'pro'],
    analytics: ['pro'],
    api_access: ['pro'],
    priority_support: ['pro'],
  };

  return featureMatrix[feature]?.includes(userPlan) ?? false;
}

// Usage limiter
export async function checkUsageLimit(
  userId: string,
  resource: string
): Promise<boolean> {
  const user = await getUserWithSubscription(userId);
  const plan = subscriptionPlans[user.plan];
  const currentUsage = await getUserResourceUsage(userId, resource);

  if (plan.limits[resource] === -1) return true; // unlimited
  return currentUsage < plan.limits[resource];
}

// React hook for feature access
export function useFeatureAccess(feature: string) {
  const { user } = useAuth();
  const hasAccess = hasFeatureAccess(user?.plan || 'free', feature);
  
  return {
    hasAccess,
    plan: user?.plan || 'free',
    upgradeUrl: '/pricing',
  };
}
```

#### 3. Trial Period Management

```typescript
// Create subscription with 14-day trial
async function startFreeTrial(userId: string, priceId: string) {
  const customer = await stripe.customers.create({
    metadata: { userId },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    trial_period_days: 14,
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    metadata: { userId },
  });

  // Update user record
  await updateUser(userId, {
    stripeCustomerId: customer.id,
    subscriptionId: subscription.id,
    trialEndsAt: new Date(subscription.trial_end * 1000),
  });

  return subscription;
}

// Check trial status
export function useTrialStatus() {
  const { user } = useAuth();
  
  const isInTrial = user?.trialEndsAt && new Date(user.trialEndsAt) > new Date();
  const daysRemaining = isInTrial
    ? Math.ceil((new Date(user.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    isInTrial,
    daysRemaining,
    trialEndsAt: user?.trialEndsAt,
  };
}
```

#### 4. Upgrade/Downgrade Flow

```typescript
// Handle plan changes
async function changePlan(userId: string, newPriceId: string) {
  const user = await getUser(userId);
  const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);

  // Update subscription
  const updatedSubscription = await stripe.subscriptions.update(
    subscription.id,
    {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    }
  );

  // Update user record
  await updateUser(userId, {
    plan: getPlanFromPriceId(newPriceId),
  });

  return updatedSubscription;
}

// React component for plan selection
export function PlanUpgradeModal({ currentPlan, onClose }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await fetch('/api/subscription/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          newPriceId: selectedPlan.priceId 
        }),
      });
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal>
      <h2>Upgrade Your Plan</h2>
      {Object.values(subscriptionPlans)
        .filter(plan => plan.price > 0 && plan.price > currentPlan.price)
        .map(plan => (
          <PlanOption
            key={plan.name}
            plan={plan}
            selected={selectedPlan?.name === plan.name}
            onSelect={() => setSelectedPlan(plan)}
          />
        ))}
      <button 
        onClick={handleUpgrade} 
        disabled={!selectedPlan || loading}
      >
        {loading ? 'Processing...' : 'Upgrade Now'}
      </button>
    </Modal>
  );
}
```

### Best Practices Summary

1. **Security**
   - Always verify webhook signatures
   - Use environment variables for keys
   - Implement proper authentication before payment operations

2. **User Experience**
   - Show clear pricing and feature comparisons
   - Provide seamless upgrade/downgrade flows
   - Handle edge cases gracefully (failed payments, expired cards)

3. **Development Workflow**
   - Use Stripe CLI for local webhook testing
   - Test all subscription states thoroughly
   - Implement proper error handling and logging

4. **Architecture**
   - Separate payment logic from business logic
   - Use webhooks for reliable state synchronization
   - Implement idempotent webhook handlers

5. **Monitoring**
   - Track subscription metrics
   - Monitor failed payments
   - Set up alerts for critical events

This research provides a comprehensive foundation for implementing a Stripe-powered freemium SaaS model with Next.js. The code examples demonstrate production-ready patterns for handling subscriptions, payments, and user management.