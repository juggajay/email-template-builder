-- Email Service Database Schema
-- Add these tables to your Supabase database

-- Email domains for verification
CREATE TABLE IF NOT EXISTS email_domains (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'resend' or 'sendgrid'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'failed'
    verification_token TEXT,
    dkim_record JSONB,
    spf_record JSONB,
    dmarc_record JSONB,
    last_checked TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, domain)
);

-- Sent emails tracking
CREATE TABLE IF NOT EXISTS sent_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email_id TEXT NOT NULL, -- Provider's email ID
    batch_id TEXT, -- For batch sends
    provider TEXT NOT NULL, -- 'resend', 'sendgrid', etc.
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'delivered', 'bounced', 'complained', 'failed'
    is_test BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX(user_id, sent_at),
    INDEX(email_id),
    INDEX(status),
    INDEX(provider)
);

-- Email batches for bulk sending
CREATE TABLE IF NOT EXISTS email_batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    batch_id TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL,
    total_emails INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'partial', 'failed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    INDEX(user_id, created_at),
    INDEX(batch_id),
    INDEX(status)
);

-- Email events for analytics (opens, clicks, bounces, etc.)
CREATE TABLE IF NOT EXISTS email_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id TEXT NOT NULL UNIQUE, -- Provider's event ID
    email_id TEXT NOT NULL, -- References sent_emails.email_id
    event_type TEXT NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed'
    recipient TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    provider TEXT NOT NULL,
    metadata JSONB,
    user_agent TEXT,
    ip_address INET,
    link_url TEXT, -- For click events
    reason TEXT, -- For bounce/complaint events
    location JSONB, -- Geographic location data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX(email_id, event_type),
    INDEX(recipient),
    INDEX(timestamp),
    INDEX(event_type),
    INDEX(provider)
);

-- Email templates with enhanced metadata
ALTER TABLE user_templates 
ADD COLUMN IF NOT EXISTS email_metadata JSONB,
ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS send_count INTEGER DEFAULT 0;

-- RLS Policies
ALTER TABLE email_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Policies for email_domains
CREATE POLICY "Users can manage their own domains" ON email_domains
    FOR ALL USING (auth.uid() = user_id);

-- Policies for sent_emails
CREATE POLICY "Users can view their own sent emails" ON sent_emails
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sent emails" ON sent_emails
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sent emails" ON sent_emails
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for email_batches
CREATE POLICY "Users can manage their own batches" ON email_batches
    FOR ALL USING (auth.uid() = user_id);

-- Policies for email_events (read-only for users, insert for webhooks)
CREATE POLICY "Users can view events for their emails" ON email_events
    FOR SELECT USING (
        email_id IN (
            SELECT email_id FROM sent_emails WHERE user_id = auth.uid()
        )
    );

-- Allow service role to insert events (for webhooks)
CREATE POLICY "Service can insert email events" ON email_events
    FOR INSERT WITH CHECK (true);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_email_domains_updated_at 
    BEFORE UPDATE ON email_domains 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sent_emails_updated_at 
    BEFORE UPDATE ON sent_emails 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sent_emails_user_sent_at ON sent_emails(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_email_timestamp ON email_events(email_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_type_timestamp ON email_events(event_type, timestamp DESC);

-- Views for analytics
CREATE OR REPLACE VIEW email_analytics_summary AS
SELECT 
    se.user_id,
    se.email_id,
    se.subject,
    se.recipient,
    se.provider,
    se.sent_at,
    COUNT(CASE WHEN ee.event_type = 'delivered' THEN 1 END) as delivered_count,
    COUNT(CASE WHEN ee.event_type = 'opened' THEN 1 END) as open_count,
    COUNT(CASE WHEN ee.event_type = 'clicked' THEN 1 END) as click_count,
    COUNT(CASE WHEN ee.event_type = 'bounced' THEN 1 END) as bounce_count,
    COUNT(CASE WHEN ee.event_type = 'complained' THEN 1 END) as complaint_count,
    MAX(CASE WHEN ee.event_type = 'opened' THEN ee.timestamp END) as last_opened_at,
    MAX(CASE WHEN ee.event_type = 'clicked' THEN ee.timestamp END) as last_clicked_at
FROM sent_emails se
LEFT JOIN email_events ee ON se.email_id = ee.email_id
GROUP BY se.user_id, se.email_id, se.subject, se.recipient, se.provider, se.sent_at;

-- Grant permissions
GRANT ALL ON email_domains TO authenticated;
GRANT ALL ON sent_emails TO authenticated;
GRANT ALL ON email_batches TO authenticated;
GRANT SELECT, INSERT ON email_events TO authenticated;
GRANT ALL ON email_events TO service_role;
GRANT SELECT ON email_analytics_summary TO authenticated;