import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';
import { validateStripeWebhook } from '@/lib/security/webhook-validation';
import { handleApiError } from '@/lib/security/error-handling';
import { logSecurityEvent, SecurityEventType, extractRequestMetadata } from '@/lib/security/monitoring';
import { withRateLimit, rateLimiters } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  // Apply rate limiting for webhooks
  const rateLimitResult = await withRateLimit(request, rateLimiters.webhook);
  if (rateLimitResult) return rateLimitResult;

  // Validate webhook signature with enhanced security
  const { valid, error, event } = await validateStripeWebhook(
    request,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (!valid || !event) {
    // Log failed webhook attempt
    await logSecurityEvent({
      type: SecurityEventType.WEBHOOK_FAILURE,
      ...extractRequestMetadata(request),
      action: 'stripe_webhook',
      result: 'failure',
      metadata: { error }
    });

    return NextResponse.json(
      { error: error || 'Invalid webhook' },
      { status: 400 }
    );
  }

  const supabase = createClient();

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        // Get the price to determine plan
        const priceId = subscription.items.data[0].price.id;
        let plan = 'free';
        
        if (priceId === 'price_pro_monthly') {
          plan = 'pro';
        } else if (priceId === 'price_agency_monthly') {
          plan = 'agency';
        }

        // Update subscription in database
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            plan: plan,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

        // Update user profile
        await supabase
          .from('user_profiles')
          .update({
            subscription_tier: plan,
            subscription_status: subscription.status,
          })
          .eq('user_id', userId);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        // Update subscription to free
        await supabase
          .from('subscriptions')
          .update({
            plan: 'free',
            status: 'canceled',
            cancel_at_period_end: false,
          })
          .eq('user_id', userId);

        // Update user profile
        await supabase
          .from('user_profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
          })
          .eq('user_id', userId);

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (subscriptionId && typeof subscriptionId === 'string') {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata.userId;

          if (userId) {
            // Reset usage count for the new billing period
            await supabase
              .from('user_profiles')
              .update({
                usage_count: 0,
                usage_reset_date: new Date().toISOString(),
              })
              .eq('user_id', userId);
          }
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (subscriptionId && typeof subscriptionId === 'string') {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata.userId;

          if (userId) {
            // Update subscription status
            await supabase
              .from('user_profiles')
              .update({
                subscription_status: 'past_due',
              })
              .eq('user_id', userId);
          }
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Log successful webhook processing
    await logSecurityEvent({
      type: SecurityEventType.DATA_EXPORT,
      ...extractRequestMetadata(request),
      action: 'stripe_webhook',
      result: 'success',
      metadata: { 
        event_type: event.type,
        event_id: event.id 
      }
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    // Log webhook processing error
    await logSecurityEvent({
      type: SecurityEventType.WEBHOOK_FAILURE,
      ...extractRequestMetadata(request),
      action: 'stripe_webhook_processing',
      result: 'failure',
      metadata: { 
        event_type: event?.type,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    return handleApiError(error, {
      action: 'process_stripe_webhook',
      event_type: event?.type,
      ...extractRequestMetadata(request)
    });
  }
}