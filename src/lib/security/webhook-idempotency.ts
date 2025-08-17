/**
 * Webhook Idempotency Handler
 * Prevents duplicate processing of webhooks
 */

import { createClient } from '@/lib/supabase/server';

// In-memory cache for recent webhook IDs (consider Redis for production)
const processedWebhooks = new Map<string, { timestamp: number; result: any }>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [id, data] of processedWebhooks.entries()) {
    if (now - data.timestamp > maxAge) {
      processedWebhooks.delete(id);
    }
  }
}, 5 * 60 * 1000);

export interface IdempotencyResult {
  isDuplicate: boolean;
  previousResult?: any;
}

/**
 * Check if a webhook has already been processed
 */
export async function checkWebhookIdempotency(
  eventId: string,
  eventType: string
): Promise<IdempotencyResult> {
  // Check in-memory cache first
  const cached = processedWebhooks.get(eventId);
  if (cached) {
    return {
      isDuplicate: true,
      previousResult: cached.result
    };
  }

  try {
    // Check database for processed webhooks
    const supabase = createClient();
    
    // Create webhook_events table if it doesn't exist
    const { data: existing } = await supabase
      .from('webhook_events')
      .select('id, processed_at, result')
      .eq('event_id', eventId)
      .eq('event_type', eventType)
      .maybeSingle();

    if (existing) {
      // Add to cache
      processedWebhooks.set(eventId, {
        timestamp: Date.now(),
        result: existing.result
      });

      return {
        isDuplicate: true,
        previousResult: existing.result
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    // If table doesn't exist or other error, assume not duplicate
    console.error('[Webhook Idempotency] Check failed:', error);
    return { isDuplicate: false };
  }
}

/**
 * Mark a webhook as processed
 */
export async function markWebhookProcessed(
  eventId: string,
  eventType: string,
  result: any = null
): Promise<void> {
  // Add to in-memory cache
  processedWebhooks.set(eventId, {
    timestamp: Date.now(),
    result
  });

  try {
    // Store in database
    const supabase = createClient();
    
    await supabase
      .from('webhook_events')
      .upsert({
        event_id: eventId,
        event_type: eventType,
        processed_at: new Date().toISOString(),
        result: result ? JSON.stringify(result) : null
      }, {
        onConflict: 'event_id'
      });
  } catch (error) {
    // Log but don't fail the webhook processing
    console.error('[Webhook Idempotency] Failed to mark as processed:', error);
  }
}

/**
 * Create the webhook_events table (run this migration in Supabase)
 */
export const WEBHOOK_EVENTS_TABLE_SQL = `
-- Create webhook_events table for idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Index for faster lookups
  INDEX idx_webhook_events_event_id (event_id),
  INDEX idx_webhook_events_created_at (created_at)
);

-- Enable Row Level Security
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access webhook events
CREATE POLICY "Service role only" ON webhook_events
  FOR ALL USING (auth.role() = 'service_role');

-- Auto-delete old webhook events after 30 days
CREATE OR REPLACE FUNCTION delete_old_webhook_events()
RETURNS void AS $$
BEGIN
  DELETE FROM webhook_events
  WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('delete-old-webhook-events', '0 0 * * *', 'SELECT delete_old_webhook_events();');
`;