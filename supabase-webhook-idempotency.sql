-- Webhook Idempotency Table
-- Prevents duplicate processing of webhooks

-- Create webhook_events table for idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);

-- Enable Row Level Security
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access webhook events (security measure)
CREATE POLICY "Service role only" ON webhook_events
  FOR ALL USING (
    -- This ensures only backend services can access webhook events
    auth.role() = 'service_role' OR 
    -- Allow authenticated users with admin role to view for debugging
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Function to auto-delete old webhook events after 30 days
CREATE OR REPLACE FUNCTION delete_old_webhook_events()
RETURNS void AS $$
BEGIN
  DELETE FROM webhook_events
  WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically clean up old events
-- This runs daily at midnight (requires pg_cron extension)
-- Uncomment the following line if pg_cron is available:
-- SELECT cron.schedule('delete-old-webhook-events', '0 0 * * *', 'SELECT delete_old_webhook_events();');

-- Alternatively, you can run this function manually or via a scheduled job:
-- SELECT delete_old_webhook_events();