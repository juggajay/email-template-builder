import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { withRateLimit, rateLimiters } from '@/lib/security/rate-limit';
import path from 'path';

export async function POST(request: NextRequest) {
  // Apply rate limiting for file uploads
  const rateLimitResult = await withRateLimit(request, rateLimiters.export);
  if (rateLimitResult) return rateLimitResult;

  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB' }, { status: 400 });
    }

    // Safely extract and validate file extension
    const filenameParts = file.name.split('.');
    const rawExt = filenameParts.length > 1 ? filenameParts.pop() : '';
    
    // Sanitize extension - only allow alphanumeric characters
    const fileExt = rawExt?.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Map of allowed extensions to MIME types for validation
    const allowedExtensions: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };
    
    // Validate extension matches MIME type
    if (!fileExt || !allowedExtensions[fileExt] || allowedExtensions[fileExt] !== file.type) {
      return NextResponse.json({ error: 'File extension does not match file type' }, { status: 400 });
    }
    
    // Generate unique filename with sanitized extension
    const safeFileName = `${uuidv4()}.${fileExt}`;
    const filePath = `email-images/${user.id}/${safeFileName}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('email-assets')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('[Image Upload] Storage error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('email-assets')
      .getPublicUrl(filePath);

    console.log('[Image Upload] Success:', {
      fileName: file.name,
      size: file.size,
      type: file.type,
      path: filePath,
      url: publicUrl
    });

    // Return URL in format expected by Unlayer
    return NextResponse.json({
      progress: 100,
      url: publicUrl,
      filelink: publicUrl // Some versions of Unlayer expect this
    });

  } catch (error) {
    console.error('[Image Upload] Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' }, 
      { status: 500 }
    );
  }
}