-- Fix RLS policies for anonymous access to public templates
-- This allows the app to work before users log in

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Public templates viewable by all" ON email_templates;

-- Create a more permissive policy for public templates
CREATE POLICY "Public templates viewable by all" ON email_templates
  FOR SELECT USING (
    is_public = true 
    OR (auth.uid() IS NOT NULL AND auth.uid() = created_by)
  );

-- Allow anonymous read access to template categories
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Template categories viewable by all" ON template_categories
  FOR SELECT USING (true);

-- Fix user profile policies to handle the case where profile might not exist yet
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix subscription policies
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a function to handle missing user profiles gracefully
CREATE OR REPLACE FUNCTION get_or_create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if profile already exists
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = NEW.id) THEN
    INSERT INTO user_profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
  END IF;
  
  -- Check if subscription already exists
  IF NOT EXISTS (SELECT 1 FROM subscriptions WHERE user_id = NEW.id) THEN
    INSERT INTO subscriptions (user_id, plan, status)
    VALUES (NEW.id, 'free', 'active');
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Update the trigger to use the new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION get_or_create_user_profile();

-- Also create profile on first login (for existing users)
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS void AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NOT NULL THEN
    -- Insert profile if it doesn't exist
    INSERT INTO user_profiles (user_id, email)
    SELECT current_user_id, auth.email()
    WHERE NOT EXISTS (
      SELECT 1 FROM user_profiles WHERE user_id = current_user_id
    );
    
    -- Insert subscription if it doesn't exist
    INSERT INTO subscriptions (user_id, plan, status)
    SELECT current_user_id, 'free', 'active'
    WHERE NOT EXISTS (
      SELECT 1 FROM subscriptions WHERE user_id = current_user_id
    );
  END IF;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION ensure_user_profile() TO authenticated;

-- Add some public templates if none exist
INSERT INTO email_templates (name, description, category, tags, is_public, is_premium, html_content)
SELECT * FROM (VALUES
  (
    'Welcome Series Template',
    'Multi-day welcome email series for new subscribers',
    'welcome',
    ARRAY['welcome', 'series', 'automation'],
    true,
    false,
    E'<!DOCTYPE html><html><head><meta charset="utf-8"><title>Welcome Series</title></head><body><h1>Welcome to our family!</h1><p>This is the start of something great.</p></body></html>'
  ),
  (
    'Holiday Sale Template',
    'Festive holiday promotion with countdown timer',
    'promotional',
    ARRAY['holiday', 'sale', 'seasonal'],
    true,
    false,
    E'<!DOCTYPE html><html><head><meta charset="utf-8"><title>Holiday Sale</title></head><body><h1>Holiday Sale - Up to 70% Off!</h1><p>Limited time offer ends soon.</p></body></html>'
  )
) AS t(name, description, category, tags, is_public, is_premium, html_content)
WHERE NOT EXISTS (
  SELECT 1 FROM email_templates WHERE is_public = true
);