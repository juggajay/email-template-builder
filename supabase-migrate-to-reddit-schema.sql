-- Migration script from old feedback system to Reddit-style system

-- OPTION 1: CLEAN INSTALL (Removes all existing feedback data)
-- Uncomment this section if you want to start fresh
/*
-- Drop existing views
DROP VIEW IF EXISTS feedback_topics_with_user_info CASCADE;

-- Drop existing tables
DROP TABLE IF EXISTS feedback_votes CASCADE;
DROP TABLE IF EXISTS feedback_comments CASCADE;
DROP TABLE IF EXISTS feedback_topics CASCADE;

-- Drop old types
DROP TYPE IF EXISTS feedback_type CASCADE;
DROP TYPE IF EXISTS feedback_status CASCADE;

-- Then run the full Reddit schema from supabase-feedback-reddit-schema.sql
*/

-- OPTION 2: SAFE CHECK (Check what exists)
-- Run this to see what tables/types already exist
SELECT 
    'TABLE' as object_type,
    table_name as object_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('feedback_topics', 'feedback_comments', 'feedback_votes', 'feedback_posts', 'post_votes', 'comment_votes')
UNION ALL
SELECT 
    'TYPE' as object_type,
    typname as object_name
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typname IN ('feedback_type', 'feedback_status', 'feedback_tag');

-- OPTION 3: MIGRATION (Preserve existing data)
-- This creates the new Reddit-style tables alongside the old ones
-- Run this if you want to keep the old system while testing the new one

-- First, check if new tables already exist
DO $$ 
BEGIN
    -- Create new tag type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_tag') THEN
        CREATE TYPE feedback_tag AS ENUM ('bug', 'feature', 'feedback', 'discussion');
    END IF;
END $$;

-- Create new posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS feedback_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tag feedback_tag NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create new comments table (with different name to avoid conflict)
CREATE TABLE IF NOT EXISTS reddit_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES feedback_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES reddit_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create vote tables
CREATE TABLE IF NOT EXISTS post_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES feedback_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS comment_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES reddit_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(comment_id, user_id)
);

-- OPTION 4: MIGRATE DATA FROM OLD TO NEW
-- Run this after creating new tables to copy data
/*
-- Migrate topics to posts
INSERT INTO feedback_posts (id, user_id, title, content, tag, created_at, updated_at)
SELECT 
    id,
    user_id,
    title,
    description as content,
    CASE 
        WHEN type = 'problem' THEN 'bug'::feedback_tag
        WHEN type = 'feature_request' THEN 'feature'::feedback_tag
        WHEN type = 'suggestion' THEN 'feedback'::feedback_tag
        ELSE 'discussion'::feedback_tag
    END as tag,
    created_at,
    updated_at
FROM feedback_topics;

-- Migrate votes
INSERT INTO post_votes (post_id, user_id, vote_type, created_at)
SELECT 
    topic_id as post_id,
    user_id,
    1 as vote_type, -- Old system only had upvotes
    created_at
FROM feedback_votes;

-- Update vote counts
UPDATE feedback_posts
SET upvotes = (SELECT COUNT(*) FROM post_votes WHERE post_id = feedback_posts.id AND vote_type = 1),
    downvotes = (SELECT COUNT(*) FROM post_votes WHERE post_id = feedback_posts.id AND vote_type = -1);
*/