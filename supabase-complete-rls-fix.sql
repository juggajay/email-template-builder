-- Complete RLS Fix for Email Template Builder
-- This script fixes all RLS policies to work properly

-- Step 1: Drop all existing policies to start fresh
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

-- Step 2: Create a function to get current user ID safely
CREATE OR REPLACE FUNCTION auth.user_id() 
RETURNS UUID 
LANGUAGE sql 
STABLE
AS $$
  SELECT auth.uid()
$$;

-- Step 3: User Profiles - Allow users to manage their own profiles
CREATE POLICY "Enable read access for users to their own profile" ON user_profiles
    FOR SELECT USING (auth.user_id() = user_id);

CREATE POLICY "Enable insert for users to create their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.user_id() = user_id);

CREATE POLICY "Enable update for users to update their own profile" ON user_profiles
    FOR UPDATE USING (auth.user_id() = user_id);

-- Step 4: Subscriptions - Allow users to manage their own subscriptions
CREATE POLICY "Enable read access for users to their own subscription" ON subscriptions
    FOR SELECT USING (auth.user_id() = user_id);

CREATE POLICY "Enable insert for users to create their own subscription" ON subscriptions
    FOR INSERT WITH CHECK (auth.user_id() = user_id);

CREATE POLICY "Enable update for users to update their own subscription" ON subscriptions
    FOR UPDATE USING (auth.user_id() = user_id);

-- Step 5: Email Templates - Public templates visible to all, private to owners
CREATE POLICY "Public templates are viewable by everyone" ON email_templates
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own private templates" ON email_templates
    FOR SELECT USING (auth.user_id() = created_by AND is_public = false);

CREATE POLICY "Users can insert their own templates" ON email_templates
    FOR INSERT WITH CHECK (auth.user_id() = created_by);

CREATE POLICY "Users can update their own templates" ON email_templates
    FOR UPDATE USING (auth.user_id() = created_by);

CREATE POLICY "Users can delete their own templates" ON email_templates
    FOR DELETE USING (auth.user_id() = created_by);

-- Step 6: User Templates - Users can only access their own
CREATE POLICY "Users can view their own user templates" ON user_templates
    FOR SELECT USING (auth.user_id() = user_id);

CREATE POLICY "Users can insert their own user templates" ON user_templates
    FOR INSERT WITH CHECK (auth.user_id() = user_id);

CREATE POLICY "Users can update their own user templates" ON user_templates
    FOR UPDATE USING (auth.user_id() = user_id);

CREATE POLICY "Users can delete their own user templates" ON user_templates
    FOR DELETE USING (auth.user_id() = user_id);

-- Step 7: Template Exports - Users can only access their own
CREATE POLICY "Users can view their own exports" ON template_exports
    FOR SELECT USING (auth.user_id() = user_id);

CREATE POLICY "Users can create their own exports" ON template_exports
    FOR INSERT WITH CHECK (auth.user_id() = user_id);

-- Step 8: Usage Analytics - Users can only access their own
CREATE POLICY "Users can view their own usage analytics" ON usage_analytics
    FOR SELECT USING (auth.user_id() = user_id);

CREATE POLICY "Users can insert their own usage analytics" ON usage_analytics
    FOR INSERT WITH CHECK (auth.user_id() = user_id);

CREATE POLICY "Users can update their own usage analytics" ON usage_analytics
    FOR UPDATE USING (auth.user_id() = user_id);

-- Step 9: Template Categories - Everyone can view categories
CREATE POLICY "Template categories are viewable by everyone" ON template_categories
    FOR SELECT USING (true);

-- Step 10: Create or update the trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Create user profile
    INSERT INTO public.user_profiles (user_id, email, full_name, subscription_tier)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'free'
    )
    ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();
    
    -- Create subscription
    INSERT INTO public.subscriptions (user_id, plan, status)
    VALUES (
        NEW.id,
        'free',
        'active'
    )
    ON CONFLICT (user_id) DO UPDATE
    SET updated_at = NOW();
    
    RETURN NEW;
END;
$$;

-- Step 11: Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 12: Create a function to ensure profile exists (for existing users)
CREATE OR REPLACE FUNCTION public.ensure_user_profile_exists()
RETURNS void
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    current_user_id UUID;
    current_user_email TEXT;
BEGIN
    -- Get current user info
    current_user_id := auth.uid();
    current_user_email := auth.jwt()->>'email';
    
    IF current_user_id IS NOT NULL THEN
        -- Create or update user profile
        INSERT INTO public.user_profiles (user_id, email, full_name, subscription_tier)
        VALUES (
            current_user_id,
            current_user_email,
            split_part(current_user_email, '@', 1),
            'free'
        )
        ON CONFLICT (user_id) DO UPDATE
        SET email = EXCLUDED.email,
            updated_at = NOW();
        
        -- Create or update subscription
        INSERT INTO public.subscriptions (user_id, plan, status)
        VALUES (
            current_user_id,
            'free',
            'active'
        )
        ON CONFLICT (user_id) DO UPDATE
        SET updated_at = NOW();
    END IF;
END;
$$;

-- Step 13: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.ensure_user_profile_exists() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Step 14: Create profiles for any existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id, email 
        FROM auth.users 
        WHERE id NOT IN (SELECT user_id FROM public.user_profiles)
    LOOP
        INSERT INTO public.user_profiles (user_id, email, full_name, subscription_tier)
        VALUES (
            user_record.id,
            user_record.email,
            split_part(user_record.email, '@', 1),
            'free'
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        INSERT INTO public.subscriptions (user_id, plan, status)
        VALUES (
            user_record.id,
            'free',
            'active'
        )
        ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
END $$;

-- Step 15: Verify RLS is enabled on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;

-- Step 16: Add some helpful views for debugging
CREATE OR REPLACE VIEW public.my_profile AS
SELECT * FROM user_profiles WHERE user_id = auth.uid();

CREATE OR REPLACE VIEW public.my_subscription AS
SELECT * FROM subscriptions WHERE user_id = auth.uid();

-- Grant access to views
GRANT SELECT ON public.my_profile TO authenticated;
GRANT SELECT ON public.my_subscription TO authenticated;

-- Step 17: Test the setup
-- This should return your user profile if you're logged in
-- SELECT * FROM my_profile;
-- SELECT * FROM my_subscription;