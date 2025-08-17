-- Check and set admin status for community moderation

-- 1. First, check if you have a user profile and what your current role is
SELECT 
    user_id,
    email,
    full_name,
    role,
    created_at
FROM user_profiles
WHERE email = 'YOUR_EMAIL_HERE'; -- Replace with your actual email

-- 2. If the role column doesn't exist, add it
-- ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 3. Set yourself as admin (replace with your actual email)
-- UPDATE user_profiles 
-- SET role = 'admin' 
-- WHERE email = 'YOUR_EMAIL_HERE';

-- 4. Verify the update worked
-- SELECT user_id, email, role FROM user_profiles WHERE role = 'admin';

-- 5. Check if the RLS policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('feedback_posts', 'feedback_comments')
AND policyname LIKE '%delete%';