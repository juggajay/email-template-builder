-- Comprehensive fix for admin deletion functionality
-- Run this entire script in Supabase SQL editor

-- Step 1: Ensure role column exists in user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Step 2: Drop existing delete policies to recreate them
DROP POLICY IF EXISTS "Users can delete their own posts" ON feedback_posts;
DROP POLICY IF EXISTS "Users can delete their own posts or admins can delete any post" ON feedback_posts;
DROP POLICY IF EXISTS "Users can delete their own comments" ON feedback_comments;
DROP POLICY IF EXISTS "Users can delete their own comments or admins can delete any comment" ON feedback_comments;

-- Step 3: Create new comprehensive delete policies
-- For posts: Allow users to delete their own OR admins to delete any
CREATE POLICY "delete_feedback_posts_policy" ON feedback_posts
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

-- For comments: Allow users to delete their own OR admins to delete any
CREATE POLICY "delete_feedback_comments_policy" ON feedback_comments
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

-- Step 4: Create a function to easily set admin status
CREATE OR REPLACE FUNCTION set_user_as_admin(user_email TEXT)
RETURNS void AS $$
BEGIN
    UPDATE user_profiles 
    SET role = 'admin' 
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'No user found with email: %', user_email;
    ELSE
        RAISE NOTICE 'User % has been set as admin', user_email;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Grant yourself admin access
-- IMPORTANT: Replace 'your-email@example.com' with your actual email
-- Uncomment and run this line:
-- SELECT set_user_as_admin('your-email@example.com');

-- Step 6: Verify the setup
-- Check all admins
SELECT user_id, email, full_name, role 
FROM user_profiles 
WHERE role = 'admin';

-- Check if policies are correctly set
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename IN ('feedback_posts', 'feedback_comments')
ORDER BY tablename, policyname;