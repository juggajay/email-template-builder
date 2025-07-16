-- Enable Row Level Security
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-super-secret-jwt-token-with-at-least-32-characters-long';

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'agency');
CREATE TYPE template_category AS ENUM ('abandoned-cart', 'product-launch', 'order-confirmation', 'welcome', 'promotional');
CREATE TYPE export_type AS ENUM ('html', 'klaviyo', 'mailchimp', 'shopify', 'omnisend');
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired');

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  brand_colors JSONB DEFAULT '{}',
  logo_url TEXT,
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  usage_count INTEGER DEFAULT 0,
  usage_reset_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email templates table
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category template_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  html_content TEXT,
  json_design JSONB,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User template customizations
CREATE TABLE user_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  customizations JSONB DEFAULT '{}',
  html_content TEXT,
  json_design JSONB,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, template_id)
);

-- Template exports tracking
CREATE TABLE template_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id),
  export_type export_type NOT NULL,
  destination TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_subscription_id TEXT,
  plan subscription_tier DEFAULT 'free',
  status subscription_status DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usage analytics table
CREATE TABLE usage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM
  exports_count INTEGER DEFAULT 0,
  storage_used BIGINT DEFAULT 0, -- in bytes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month)
);

-- Template categories lookup table
CREATE TABLE template_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default template categories
INSERT INTO template_categories (name, description, icon, sort_order) VALUES
  ('abandoned-cart', 'Recover lost sales with compelling cart abandonment emails', 'shopping-cart', 1),
  ('product-launch', 'Announce new products and create buzz', 'rocket', 2),
  ('order-confirmation', 'Confirm orders and provide shipping information', 'check-circle', 3),
  ('welcome', 'Welcome new subscribers and customers', 'user-plus', 4),
  ('promotional', 'Drive sales with promotional campaigns', 'percent', 5);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_templates_is_public ON email_templates(is_public);
CREATE INDEX idx_email_templates_created_by ON email_templates(created_by);
CREATE INDEX idx_user_templates_user_id ON user_templates(user_id);
CREATE INDEX idx_user_templates_template_id ON user_templates(template_id);
CREATE INDEX idx_template_exports_user_id ON template_exports(user_id);
CREATE INDEX idx_template_exports_created_at ON template_exports(created_at);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_usage_analytics_user_id_month ON usage_analytics(user_id, month);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- User profiles: users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Email templates: public templates visible to all, private only to owner
CREATE POLICY "Public templates viewable by all" ON email_templates
  FOR SELECT USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create templates" ON email_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates" ON email_templates
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own templates" ON email_templates
  FOR DELETE USING (auth.uid() = created_by);

-- User templates: only accessible to owner
CREATE POLICY "Users can manage own user templates" ON user_templates
  FOR ALL USING (auth.uid() = user_id);

-- Template exports: only accessible to owner
CREATE POLICY "Users can manage own exports" ON template_exports
  FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: only accessible to owner
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usage analytics: only accessible to owner
CREATE POLICY "Users can manage own usage analytics" ON usage_analytics
  FOR ALL USING (auth.uid() = user_id);

-- Functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create user profile after signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Function to increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE email_templates 
  SET usage_count = usage_count + 1
  WHERE id = NEW.template_id;
  
  -- Update user usage count
  UPDATE user_profiles 
  SET usage_count = usage_count + 1
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to increment usage count on export
CREATE TRIGGER on_template_export
  AFTER INSERT ON template_exports
  FOR EACH ROW EXECUTE FUNCTION increment_template_usage();

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles 
  SET usage_count = 0, 
      usage_reset_date = CURRENT_TIMESTAMP
  WHERE subscription_tier = 'free' 
    AND usage_reset_date <= CURRENT_TIMESTAMP - INTERVAL '1 month';
END;
$$ language 'plpgsql';

-- Create a scheduled job to reset usage monthly (requires pg_cron extension)
-- SELECT cron.schedule('reset-monthly-usage', '0 0 1 * *', 'SELECT reset_monthly_usage();');

-- Insert some sample templates for development
INSERT INTO email_templates (name, description, category, tags, is_public, is_premium, html_content) VALUES
  (
    'Abandoned Cart Recovery',
    'Professional abandoned cart email template with product showcase',
    'abandoned-cart',
    ARRAY['ecommerce', 'recovery', 'sales'],
    true,
    false,
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Complete Your Purchase</title></head><body><h1>You left something in your cart!</h1><p>Complete your purchase before these items are gone.</p></body></html>'
  ),
  (
    'Product Launch Announcement',
    'Eye-catching product launch template with countdown timer',
    'product-launch',
    ARRAY['launch', 'product', 'announcement'],
    true,
    false,
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>New Product Launch</title></head><body><h1>Introducing Our Latest Product!</h1><p>Be the first to get your hands on our newest innovation.</p></body></html>'
  ),
  (
    'Order Confirmation',
    'Clean order confirmation with shipping details',
    'order-confirmation',
    ARRAY['order', 'confirmation', 'receipt'],
    true,
    false,
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Order Confirmation</title></head><body><h1>Thank you for your order!</h1><p>Your order has been confirmed and will ship soon.</p></body></html>'
  ),
  (
    'Welcome Email',
    'Warm welcome email for new subscribers',
    'welcome',
    ARRAY['welcome', 'onboarding', 'subscriber'],
    true,
    false,
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Welcome!</title></head><body><h1>Welcome to our community!</h1><p>Thanks for subscribing. Here\'s what to expect next.</p></body></html>'
  ),
  (
    'Flash Sale Promotion',
    'Urgent promotional email with discount code',
    'promotional',
    ARRAY['sale', 'promotion', 'discount'],
    true,
    true,
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Flash Sale</title></head><body><h1>24-Hour Flash Sale!</h1><p>Get 50% off everything. Use code FLASH50 at checkout.</p></body></html>'
  );

COMMENT ON TABLE user_profiles IS 'User profile information and subscription details';
COMMENT ON TABLE email_templates IS 'Email template library with categories and content';
COMMENT ON TABLE user_templates IS 'User customizations of base templates';
COMMENT ON TABLE template_exports IS 'Track template exports for usage analytics';
COMMENT ON TABLE subscriptions IS 'User subscription and billing information';
COMMENT ON TABLE usage_analytics IS 'Monthly usage analytics for users';
COMMENT ON TABLE template_categories IS 'Template category definitions';