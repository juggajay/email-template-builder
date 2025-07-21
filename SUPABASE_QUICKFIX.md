# Quick Fix for Supabase 406 Errors

## Option 1: Disable RLS (Fastest for Testing)

Run this in Supabase SQL Editor:

```sql
-- Disable RLS on all tables for testing
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE template_exports DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE template_categories DISABLE ROW LEVEL SECURITY;
```

## Option 2: Create Missing User Data

Run this with your user ID:

```sql
-- Replace with your actual user ID from the error
INSERT INTO user_profiles (user_id, email, full_name, subscription_tier)
VALUES (
  'd7e895ae-57c8-4c82-837a-17e3bc87d5b0',
  'user@example.com',
  'Test User',
  'free'
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO subscriptions (user_id, plan, status)
VALUES (
  'd7e895ae-57c8-4c82-837a-17e3bc87d5b0',
  'free',
  'active'
) ON CONFLICT (user_id) DO NOTHING;
```

## Option 3: Fix Authentication

Make sure your `.env.local` has the correct keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uvcebvlmufytjxiysbhr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
```

Get these from: Supabase Dashboard → Settings → API

## After Running Any Fix:

1. Clear browser cache (Ctrl+Shift+R)
2. Restart the development server
3. Try logging out and logging in again

## Note:
The 406 errors mean Supabase is rejecting the queries due to Row Level Security. The quickest fix for development is Option 1 (disable RLS), but for production you'll need proper RLS policies.