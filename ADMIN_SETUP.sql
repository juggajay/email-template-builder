-- ADMIN SETUP FOR COMMUNITY MODERATION
-- Run this entire script in Supabase SQL Editor

-- ================================================
-- STEP 1: Check your current user profile
-- ================================================
-- First, find your user_id and current role
-- Replace 'YOUR_EMAIL_HERE' with your actual email address

SELECT 
    user_id,
    email,
    full_name,
    role
FROM user_profiles
WHERE email = 'YOUR_EMAIL_HERE';

-- ================================================
-- STEP 2: Set yourself as admin
-- ================================================
-- Replace 'YOUR_EMAIL_HERE' with your actual email address

UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'YOUR_EMAIL_HERE';

-- ================================================
-- STEP 3: Verify admin status was set
-- ================================================

SELECT 
    user_id,
    email,
    full_name,
    role
FROM user_profiles
WHERE email = 'YOUR_EMAIL_HERE';

-- You should see role = 'admin' now

-- ================================================
-- STEP 4: Fix the RLS policies (if not already done)
-- ================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can delete their own posts" ON feedback_posts;
DROP POLICY IF EXISTS "Users can delete their own posts or admins can delete any post" ON feedback_posts;
DROP POLICY IF EXISTS "delete_feedback_posts_policy" ON feedback_posts;

DROP POLICY IF EXISTS "Users can delete their own comments" ON feedback_comments;
DROP POLICY IF EXISTS "Users can delete their own comments or admins can delete any comment" ON feedback_comments;
DROP POLICY IF EXISTS "delete_feedback_comments_policy" ON feedback_comments;

-- Create new delete policy for posts
CREATE POLICY "delete_posts_policy" ON feedback_posts
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
CREATE POLICY "delete_comments_policy" ON feedback_comments
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
-- STEP 5: List all admins
-- ================================================

SELECT 
    user_id,
    email,
    full_name,
    role,
    created_at
FROM user_profiles
WHERE role = 'admin'
ORDER BY created_at;

-- ================================================
-- DONE! You should now be able to delete any post
-- ================================================
-- After running this script:
-- 1. Refresh your browser page
-- 2. You should see delete buttons on all posts
-- 3. Click a delete button to test