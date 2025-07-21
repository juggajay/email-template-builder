-- Reddit-style Feedback System Database Schema for ZebaMail Beta
-- Supports both upvotes and downvotes for posts and comments

-- Drop existing tables and types if needed for clean migration
-- DROP TABLE IF EXISTS feedback_votes CASCADE;
-- DROP TABLE IF EXISTS feedback_comments CASCADE;
-- DROP TABLE IF EXISTS feedback_topics CASCADE;
-- DROP TYPE IF EXISTS feedback_type;
-- DROP TYPE IF EXISTS feedback_status;

-- Create enum for feedback types (Reddit-style tags)
CREATE TYPE feedback_tag AS ENUM ('bug', 'feature', 'feedback', 'discussion');

-- Feedback posts table (formerly topics)
CREATE TABLE feedback_posts (
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

-- Feedback comments table with voting
CREATE TABLE feedback_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES feedback_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES feedback_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Post votes table
CREATE TABLE post_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES feedback_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)), -- 1 for upvote, -1 for downvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Comment votes table
CREATE TABLE comment_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES feedback_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)), -- 1 for upvote, -1 for downvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(comment_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_feedback_posts_user_id ON feedback_posts(user_id);
CREATE INDEX idx_feedback_posts_tag ON feedback_posts(tag);
CREATE INDEX idx_feedback_posts_created_at ON feedback_posts(created_at DESC);
CREATE INDEX idx_feedback_posts_score ON feedback_posts(score DESC);
CREATE INDEX idx_feedback_comments_post_id ON feedback_comments(post_id);
CREATE INDEX idx_feedback_comments_parent_id ON feedback_comments(parent_id);
CREATE INDEX idx_feedback_comments_score ON feedback_comments(score DESC);
CREATE INDEX idx_post_votes_post_id ON post_votes(post_id);
CREATE INDEX idx_post_votes_user_id ON post_votes(user_id);
CREATE INDEX idx_comment_votes_comment_id ON comment_votes(comment_id);
CREATE INDEX idx_comment_votes_user_id ON comment_votes(user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_feedback_posts_updated_at BEFORE UPDATE ON feedback_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_comments_updated_at BEFORE UPDATE ON feedback_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update post vote counts
CREATE OR REPLACE FUNCTION update_post_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE feedback_posts
        SET upvotes = (SELECT COUNT(*) FROM post_votes WHERE post_id = NEW.post_id AND vote_type = 1),
            downvotes = (SELECT COUNT(*) FROM post_votes WHERE post_id = NEW.post_id AND vote_type = -1)
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE feedback_posts
        SET upvotes = (SELECT COUNT(*) FROM post_votes WHERE post_id = OLD.post_id AND vote_type = 1),
            downvotes = (SELECT COUNT(*) FROM post_votes WHERE post_id = OLD.post_id AND vote_type = -1)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to update comment vote counts
CREATE OR REPLACE FUNCTION update_comment_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE feedback_comments
        SET upvotes = (SELECT COUNT(*) FROM comment_votes WHERE comment_id = NEW.comment_id AND vote_type = 1),
            downvotes = (SELECT COUNT(*) FROM comment_votes WHERE comment_id = NEW.comment_id AND vote_type = -1)
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE feedback_comments
        SET upvotes = (SELECT COUNT(*) FROM comment_votes WHERE comment_id = OLD.comment_id AND vote_type = 1),
            downvotes = (SELECT COUNT(*) FROM comment_votes WHERE comment_id = OLD.comment_id AND vote_type = -1)
        WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to update comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE feedback_posts
        SET comment_count = comment_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE feedback_posts
        SET comment_count = GREATEST(0, comment_count - 1)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for vote counting
CREATE TRIGGER on_post_vote_change
    AFTER INSERT OR UPDATE OR DELETE ON post_votes
    FOR EACH ROW EXECUTE FUNCTION update_post_votes();

CREATE TRIGGER on_comment_vote_change
    AFTER INSERT OR UPDATE OR DELETE ON comment_votes
    FOR EACH ROW EXECUTE FUNCTION update_comment_votes();

-- Create trigger for comment counting
CREATE TRIGGER on_comment_change
    AFTER INSERT OR DELETE ON feedback_comments
    FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- Row Level Security (RLS)
ALTER TABLE feedback_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;

-- Policies for feedback_posts
CREATE POLICY "Anyone can view posts" ON feedback_posts
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON feedback_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON feedback_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON feedback_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for feedback_comments
CREATE POLICY "Anyone can view comments" ON feedback_comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON feedback_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON feedback_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON feedback_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for post_votes
CREATE POLICY "Anyone can view post votes" ON post_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own post votes" ON post_votes
    FOR ALL USING (auth.uid() = user_id);

-- Policies for comment_votes
CREATE POLICY "Anyone can view comment votes" ON comment_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own comment votes" ON comment_votes
    FOR ALL USING (auth.uid() = user_id);

-- View for posts with user info and vote status
CREATE OR REPLACE VIEW feedback_posts_with_user_info AS
SELECT 
    fp.*,
    SPLIT_PART(up.full_name, ' ', 1) AS author_first_name,
    up.logo_url AS author_avatar,
    pv.vote_type AS user_vote_type
FROM feedback_posts fp
LEFT JOIN user_profiles up ON fp.user_id = up.user_id
LEFT JOIN post_votes pv ON fp.id = pv.post_id AND pv.user_id = auth.uid();

-- View for comments with user info and vote status
CREATE OR REPLACE VIEW feedback_comments_with_user_info AS
SELECT 
    fc.*,
    SPLIT_PART(up.full_name, ' ', 1) AS author_first_name,
    up.logo_url AS author_avatar,
    cv.vote_type AS user_vote_type
FROM feedback_comments fc
LEFT JOIN user_profiles up ON fc.user_id = up.user_id
LEFT JOIN comment_votes cv ON fc.id = cv.comment_id AND cv.user_id = auth.uid();

-- Grant permissions
GRANT ALL ON feedback_posts TO authenticated;
GRANT ALL ON feedback_comments TO authenticated;
GRANT ALL ON post_votes TO authenticated;
GRANT ALL ON comment_votes TO authenticated;
GRANT SELECT ON feedback_posts_with_user_info TO authenticated;
GRANT SELECT ON feedback_comments_with_user_info TO authenticated;