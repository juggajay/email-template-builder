-- ADMIN SETUP FOR jaysonryan21@hotmail.com
-- Run this entire script in Supabase SQL Editor

-- ================================================
-- STEP 1: Check your current user profile
-- ================================================
SELECT 
    user_id,
    email,
    full_name,
    role
FROM user_profiles
WHERE email = 'jaysonryan21@hotmail.com';

-- ================================================
-- STEP 2: Set you as admin
-- ================================================
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'jaysonryan21@hotmail.com';

-- ================================================
-- STEP 3: Verify admin status was set
-- ================================================
SELECT 
    user_id,
    email,
    full_name,
    role
FROM user_profiles
WHERE email = 'jaysonryan21@hotmail.com';

-- You should see role = 'admin' now

-- ================================================
-- STEP 4: Fix the RLS policies
-- ================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can delete their own posts" ON feedback_posts;
DROP POLICY IF EXISTS "Users can delete their own posts or admins can delete any post" ON feedback_posts;
DROP POLICY IF EXISTS "delete_feedback_posts_policy" ON feedback_posts;
DROP POLICY IF EXISTS "delete_posts_policy" ON feedback_posts;

DROP POLICY IF EXISTS "Users can delete their own comments" ON feedback_comments;
DROP POLICY IF EXISTS "Users can delete their own comments or admins can delete any comment" ON feedback_comments;
DROP POLICY IF EXISTS "delete_feedback_comments_policy" ON feedback_comments;
DROP POLICY IF EXISTS "delete_comments_policy" ON feedback_comments;

-- Create new delete policy for posts
CREATE POLICY "admin_or_owner_delete_posts" ON feedback_posts
FOR DELETE 
TO authenticated
USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

-- Create new delete policy for comments
CREATE POLICY "admin_or_owner_delete_comments" ON feedback_comments
FOR DELETE 
TO authenticated
USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

-- ================================================
-- STEP 5: Verify everything is set up
-- ================================================

-- Check that you're an admin
SELECT 
    'YOUR ADMIN STATUS:' as info,
    user_id,
    email,
    role
FROM user_profiles
WHERE email = 'jaysonryan21@hotmail.com';

-- Check that policies exist
SELECT 
    'DELETE POLICIES:' as info,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename IN ('feedback_posts', 'feedback_comments')
AND policyname LIKE '%delete%';

-- List all admins
SELECT 
    'ALL ADMINS:' as info,
    email,
    full_name,
    role
FROM user_profiles
WHERE role = 'admin';

-- ================================================
-- DONE! You can now delete any post/comment
-- ================================================
-- After running this script:
-- 1. Refresh your browser on the community page
-- 2. You should see delete buttons (trash icons) on ALL posts
-- 3. Click any delete button to test