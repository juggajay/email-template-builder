# RLS Fix Instructions

## Step 1: Run the Complete Fix Script

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy the entire contents of `supabase-complete-rls-fix.sql`
4. Paste and click **Run**

This script will:
- ✅ Drop all broken policies
- ✅ Create proper RLS policies for all tables
- ✅ Set up automatic user profile creation
- ✅ Create profiles for existing users
- ✅ Add helper views for debugging

## Step 2: Verify Your User Profile

After running the script, check if your profile exists:

```sql
-- Check your profile
SELECT * FROM my_profile;

-- Check your subscription
SELECT * FROM my_subscription;

-- If empty, manually create:
SELECT ensure_user_profile_exists();
```

## Step 3: Test in Your App

1. Clear browser cache: `Ctrl+Shift+R`
2. Log out and log back in
3. The 406 errors should be gone

## Troubleshooting

If you still see 406 errors:

### Check which table is failing:
```sql
-- See all your data
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles WHERE user_id = auth.uid()
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions WHERE user_id = auth.uid()
UNION ALL
SELECT 'email_templates', COUNT(*) FROM email_templates WHERE is_public = true;
```

### Check current policies:
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Nuclear option (development only):
```sql
-- Disable all RLS (NOT for production!)
DO $$ 
DECLARE
    t RECORD;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', t.tablename);
    END LOOP;
END $$;
```

## Expected Result

After running the fix:
- ✅ No more 406 errors
- ✅ User profiles auto-created on signup
- ✅ Public templates visible to all
- ✅ Private data properly secured

## Production Checklist

Before going to production:
1. ✅ All RLS policies tested
2. ✅ Service role key not exposed to client
3. ✅ Environment variables properly set
4. ✅ No RLS disabled on any table