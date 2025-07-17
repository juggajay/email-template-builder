-- =====================================================
-- FINAL SUPABASE SCRIPTS - Email Template Builder
-- =====================================================
-- Run these scripts in order to fix all issues

-- =====================================================
-- PART 1: Fix RLS and User Profile Issues
-- =====================================================

-- Drop all existing policies first
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Create proper RLS policies for all tables
-- User Profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Email Templates
CREATE POLICY "Anyone can view public templates" ON email_templates
    FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own templates" ON email_templates
    FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create templates" ON email_templates
    FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own templates" ON email_templates
    FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own templates" ON email_templates
    FOR DELETE USING (auth.uid() = created_by);

-- User Templates
CREATE POLICY "Users can manage own user templates" ON user_templates
    FOR ALL USING (auth.uid() = user_id);

-- Template Exports
CREATE POLICY "Users can manage own exports" ON template_exports
    FOR ALL USING (auth.uid() = user_id);

-- Usage Analytics
CREATE POLICY "Users can manage own analytics" ON usage_analytics
    FOR ALL USING (auth.uid() = user_id);

-- Template Categories (public access)
CREATE POLICY "Anyone can view categories" ON template_categories
    FOR SELECT USING (true);

-- =====================================================
-- PART 2: Fix User Profile Creation
-- =====================================================

-- Improved function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_name TEXT;
BEGIN
    -- Extract name from email
    default_name := split_part(NEW.email, '@', 1);
    
    -- Create user profile
    INSERT INTO public.user_profiles (
        user_id, 
        email, 
        full_name, 
        subscription_tier,
        subscription_status,
        usage_count,
        usage_reset_date
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', default_name),
        'free',
        'active',
        0,
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    
    -- Create subscription record
    INSERT INTO public.subscriptions (
        user_id,
        plan,
        status,
        current_period_start,
        current_period_end
    ) VALUES (
        NEW.id,
        'free',
        'active',
        NOW(),
        NOW() + INTERVAL '30 days'
    ) ON CONFLICT (user_id) DO UPDATE SET
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PART 3: Create Missing Profiles for Existing Users
-- =====================================================

-- Create profiles for any users that don't have them
INSERT INTO user_profiles (user_id, email, full_name, subscription_tier)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    'free'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Create subscriptions for users that don't have them
INSERT INTO subscriptions (user_id, plan, status)
SELECT 
    id,
    'free',
    'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- PART 4: Add Missing Indexes for Performance
-- =====================================================

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_email_templates_is_public_created_at 
    ON email_templates(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_templates_created_by_created_at 
    ON email_templates(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_exports_user_id_created_at 
    ON template_exports(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_templates_user_id_last_modified 
    ON user_templates(user_id, last_modified DESC);

-- =====================================================
-- PART 5: Add Helper Functions
-- =====================================================

-- Function to get user's template count
CREATE OR REPLACE FUNCTION get_user_template_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM email_templates 
        WHERE created_by = user_uuid
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get user's export count for current month
CREATE OR REPLACE FUNCTION get_user_monthly_exports(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM template_exports 
        WHERE user_id = user_uuid 
        AND created_at >= date_trunc('month', CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- PART 6: Add Sample Data (Optional)
-- =====================================================

-- Add more sample templates if needed
INSERT INTO email_templates (name, description, category, tags, is_public, is_premium, html_content, created_by)
VALUES 
    (
        'Black Friday Sale',
        'High-converting Black Friday email template',
        'promotional'::template_category,
        ARRAY['black-friday', 'sale', 'holiday'],
        true,
        false,
        E'<!DOCTYPE html><html><head><title>Black Friday Sale</title></head><body><h1>Black Friday Mega Sale!</h1><p>Up to 80% off everything!</p></body></html>',
        NULL
    ),
    (
        'Customer Review Request',
        'Polite review request email template',
        'order-confirmation'::template_category,
        ARRAY['review', 'feedback', 'post-purchase'],
        true,
        false,
        E'<!DOCTYPE html><html><head><title>Review Request</title></head><body><h1>How was your experience?</h1><p>We\'d love to hear your feedback!</p></body></html>',
        NULL
    )
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 7: Create Views for Common Queries
-- =====================================================

-- View for user dashboard stats
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT 
    u.user_id,
    u.email,
    u.subscription_tier,
    COUNT(DISTINCT et.id) as total_templates,
    COUNT(DISTINCT te.id) as total_exports,
    COUNT(DISTINCT CASE 
        WHEN te.created_at >= date_trunc('month', CURRENT_DATE) 
        THEN te.id 
    END) as exports_this_month
FROM user_profiles u
LEFT JOIN email_templates et ON et.created_by = u.user_id
LEFT JOIN template_exports te ON te.user_id = u.user_id
GROUP BY u.user_id, u.email, u.subscription_tier;

-- Grant access to views
GRANT SELECT ON user_dashboard_stats TO authenticated;

-- =====================================================
-- PART 8: Verify Everything is Working
-- =====================================================

-- Check if RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'user_profiles', 'subscriptions', 'email_templates', 
    'user_templates', 'template_exports', 'usage_analytics'
);

-- Check current user's data (run this while logged in)
-- SELECT * FROM user_profiles WHERE user_id = auth.uid();
-- SELECT * FROM subscriptions WHERE user_id = auth.uid();
-- SELECT COUNT(*) FROM email_templates WHERE is_public = true;