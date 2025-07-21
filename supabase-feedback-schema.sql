-- Feedback System Database Schema for ZebaMail Beta

-- Create enum for feedback types
CREATE TYPE feedback_type AS ENUM ('problem', 'suggestion', 'feature_request', 'praise');

-- Create enum for feedback status
CREATE TYPE feedback_status AS ENUM ('open', 'in_review', 'planned', 'in_progress', 'completed', 'closed');

-- Feedback topics table
CREATE TABLE feedback_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type feedback_type NOT NULL DEFAULT 'suggestion',
  status feedback_status NOT NULL DEFAULT 'open',
  upvote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Feedback comments table
CREATE TABLE feedback_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES feedback_topics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_staff_response BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Feedback votes table (for upvoting)
CREATE TABLE feedback_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES feedback_topics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(topic_id, user_id) -- Prevent duplicate votes
);

-- Create indexes for performance
CREATE INDEX idx_feedback_topics_user_id ON feedback_topics(user_id);
CREATE INDEX idx_feedback_topics_status ON feedback_topics(status);
CREATE INDEX idx_feedback_topics_type ON feedback_topics(type);
CREATE INDEX idx_feedback_topics_created_at ON feedback_topics(created_at DESC);
CREATE INDEX idx_feedback_topics_upvote_count ON feedback_topics(upvote_count DESC);
CREATE INDEX idx_feedback_comments_topic_id ON feedback_comments(topic_id);
CREATE INDEX idx_feedback_votes_topic_id ON feedback_votes(topic_id);
CREATE INDEX idx_feedback_votes_user_id ON feedback_votes(user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_feedback_topics_updated_at BEFORE UPDATE ON feedback_topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_comments_updated_at BEFORE UPDATE ON feedback_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment upvote count
CREATE OR REPLACE FUNCTION increment_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE feedback_topics
    SET upvote_count = upvote_count + 1
    WHERE id = NEW.topic_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to decrement upvote count
CREATE OR REPLACE FUNCTION decrement_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE feedback_topics
    SET upvote_count = GREATEST(0, upvote_count - 1)
    WHERE id = OLD.topic_id;
    RETURN OLD;
END;
$$ language 'plpgsql';

-- Function to increment comment count
CREATE OR REPLACE FUNCTION increment_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE feedback_topics
    SET comment_count = comment_count + 1
    WHERE id = NEW.topic_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to decrement comment count
CREATE OR REPLACE FUNCTION decrement_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE feedback_topics
    SET comment_count = GREATEST(0, comment_count - 1)
    WHERE id = OLD.topic_id;
    RETURN OLD;
END;
$$ language 'plpgsql';

-- Create triggers for vote counting
CREATE TRIGGER on_feedback_vote_insert
    AFTER INSERT ON feedback_votes
    FOR EACH ROW EXECUTE FUNCTION increment_upvote_count();

CREATE TRIGGER on_feedback_vote_delete
    AFTER DELETE ON feedback_votes
    FOR EACH ROW EXECUTE FUNCTION decrement_upvote_count();

-- Create triggers for comment counting
CREATE TRIGGER on_feedback_comment_insert
    AFTER INSERT ON feedback_comments
    FOR EACH ROW EXECUTE FUNCTION increment_comment_count();

CREATE TRIGGER on_feedback_comment_delete
    AFTER DELETE ON feedback_comments
    FOR EACH ROW EXECUTE FUNCTION decrement_comment_count();

-- Row Level Security (RLS)
ALTER TABLE feedback_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_votes ENABLE ROW LEVEL SECURITY;

-- Policies for feedback_topics
CREATE POLICY "Users can view all feedback topics" ON feedback_topics
    FOR SELECT USING (true);

CREATE POLICY "Users can create feedback topics" ON feedback_topics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback topics" ON feedback_topics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback topics" ON feedback_topics
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for feedback_comments
CREATE POLICY "Users can view all feedback comments" ON feedback_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create feedback comments" ON feedback_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback comments" ON feedback_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback comments" ON feedback_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for feedback_votes
CREATE POLICY "Users can view all feedback votes" ON feedback_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own votes" ON feedback_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON feedback_votes
    FOR DELETE USING (auth.uid() = user_id);

-- View for feedback topics with user info and vote status
CREATE OR REPLACE VIEW feedback_topics_with_user_info AS
SELECT 
    ft.*,
    up.full_name AS author_name,
    up.avatar_url AS author_avatar,
    up.role AS author_role,
    EXISTS(
        SELECT 1 FROM feedback_votes fv 
        WHERE fv.topic_id = ft.id 
        AND fv.user_id = auth.uid()
    ) AS user_has_voted
FROM feedback_topics ft
LEFT JOIN user_profiles up ON ft.user_id = up.id;