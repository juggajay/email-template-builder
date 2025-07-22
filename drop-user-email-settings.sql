-- Drop user email settings table and related objects
-- Run this in your Supabase SQL editor to clean up

-- Drop policies first
DROP POLICY IF EXISTS "Users can view their own email settings" ON user_email_settings;
DROP POLICY IF EXISTS "Users can update their own email settings" ON user_email_settings;
DROP POLICY IF EXISTS "Users can insert their own email settings" ON user_email_settings;
DROP POLICY IF EXISTS "Users can view their own quotas" ON email_quotas;
DROP POLICY IF EXISTS "Service can manage quotas" ON email_quotas;

-- Drop functions
DROP FUNCTION IF EXISTS encrypt_api_key(TEXT);
DROP FUNCTION IF EXISTS check_email_quota(UUID);
DROP FUNCTION IF EXISTS increment_email_quota(UUID, INTEGER);

-- Drop triggers
DROP TRIGGER IF EXISTS update_user_email_settings_updated_at ON user_email_settings;

-- Drop tables
DROP TABLE IF EXISTS email_quotas CASCADE;
DROP TABLE IF EXISTS user_email_settings CASCADE;