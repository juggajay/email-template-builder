-- Create storage bucket for email images
INSERT INTO storage.buckets (id, name, public)
VALUES ('email-images', 'email-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create table to track uploaded images
CREATE TABLE IF NOT EXISTS uploaded_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_uploaded_images_user_id ON uploaded_images(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_images_uploaded_at ON uploaded_images(uploaded_at);

-- RLS policies for uploaded_images
ALTER TABLE uploaded_images ENABLE ROW LEVEL SECURITY;

-- Users can only see their own uploads
CREATE POLICY "Users can view own uploads" ON uploaded_images
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own uploads
CREATE POLICY "Users can insert own uploads" ON uploaded_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads" ON uploaded_images
  FOR DELETE USING (auth.uid() = user_id);

-- Storage policies for email-images bucket
CREATE POLICY "Users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'email-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'email-images');

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'email-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );