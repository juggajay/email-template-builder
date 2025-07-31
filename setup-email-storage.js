const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function setupEmailStorage() {
  try {
    console.log('Setting up email-assets storage bucket...');
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.id === 'email-assets');
    
    if (bucketExists) {
      console.log('Bucket email-assets already exists');
      
      // Update bucket to ensure it's public
      const { error: updateError } = await supabase
        .storage
        .updateBucket('email-assets', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        });
      
      if (updateError) {
        console.error('Error updating bucket:', updateError);
      } else {
        console.log('Bucket updated successfully');
      }
    } else {
      // Create new bucket
      const { error: createError } = await supabase
        .storage
        .createBucket('email-assets', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
      } else {
        console.log('Bucket created successfully');
      }
    }
    
    console.log('Email storage setup complete!');
    console.log('Note: RLS policies should be set up in Supabase dashboard');
    
  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupEmailStorage();