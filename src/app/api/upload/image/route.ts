import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed types: ' + ALLOWED_TYPES.join(', ') 
      }, { status: 400 });
    }

    // Validate file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json({ 
        error: 'Invalid file extension' 
      }, { status: 400 });
    }

    // Generate unique filename
    const filename = `${user.id}/${uuidv4()}${extension}`;
    
    console.log('[ImageUpload] Uploading file:', filename, 'Size:', file.size);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('email-images')
      .upload(filename, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('[ImageUpload] Upload error:', error);
      return NextResponse.json({ 
        error: 'Failed to upload image' 
      }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('email-images')
      .getPublicUrl(filename);

    console.log('[ImageUpload] Upload successful:', publicUrl);

    // Store upload record
    await supabase
      .from('uploaded_images')
      .insert({
        user_id: user.id,
        filename: filename,
        original_name: file.name,
        size: file.size,
        mime_type: file.type,
        url: publicUrl,
        uploaded_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename
    });

  } catch (error) {
    console.error('[ImageUpload] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process upload' 
    }, { status: 500 });
  }
}