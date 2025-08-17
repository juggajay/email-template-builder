-- Add admin delete capability for community posts
-- This updates the RLS policy to allow admins to delete any post

-- First, drop the existing delete policy for feedback_posts
DROP POLICY IF EXISTS "Users can delete their own posts" ON feedback_posts;

-- Create a new delete policy that allows users to delete their own posts OR admins to delete any post
CREATE POLICY "Users can delete their own posts or admins can delete any post" ON feedback_posts
    FOR DELETE USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Similarly for comments, allow admins to delete any comment
DROP POLICY IF EXISTS "Users can delete their own comments" ON feedback_comments;

CREATE POLICY "Users can delete their own comments or admins can delete any comment" ON feedback_comments
    FOR DELETE USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Grant admin role to specific users (replace with actual admin email)
-- UPDATE user_profiles 
-- SET role = 'admin' 
-- WHERE email = 'admin@example.com';