-- Create storage bucket for email images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'email-assets',
  'email-assets', 
  true, -- Public bucket for email images
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[];

-- Create RLS policies for the bucket
CREATE POLICY "Anyone can view email images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'email-assets');

CREATE POLICY "Authenticated users can upload email images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'email-assets' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own email images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'email-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own email images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'email-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);