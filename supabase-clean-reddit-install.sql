-- Clean install of Reddit-style community board
-- This will remove ALL existing feedback data and start fresh

-- Step 1: Drop all existing feedback-related objects
DROP VIEW IF EXISTS feedback_topics_with_user_info CASCADE;
DROP VIEW IF EXISTS feedback_posts_with_user_info CASCADE;
DROP VIEW IF EXISTS feedback_comments_with_user_info CASCADE;

DROP TABLE IF EXISTS feedback_votes CASCADE;
DROP TABLE IF EXISTS comment_votes CASCADE;
DROP TABLE IF EXISTS post_votes CASCADE;
DROP TABLE IF EXISTS feedback_comments CASCADE;
DROP TABLE IF EXISTS feedback_topics CASCADE;
DROP TABLE IF EXISTS feedback_posts CASCADE;

DROP TYPE IF EXISTS feedback_type CASCADE;
DROP TYPE IF EXISTS feedback_status CASCADE;
DROP TYPE IF EXISTS feedback_tag CASCADE;

-- Step 2: Add role column if needed
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'beta_tester'));

-- Step 3: Now run the full Reddit schema from supabase-feedback-reddit-schema.sql
-- Copy and paste the entire contents of that file here