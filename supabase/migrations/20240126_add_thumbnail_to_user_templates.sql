-- Add thumbnail_url column to user_templates table
ALTER TABLE user_templates ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add comment for clarity
COMMENT ON COLUMN user_templates.thumbnail_url IS 'URL for the template thumbnail image';