/**
 * Custom Image Upload Handler for Unlayer
 * Uploads images to our own server instead of Unlayer's S3
 * This fixes the issue where email clients block S3 URLs
 */

interface UploadProgress {
  progress: number;
  url?: string;
}

interface UnlayerFile {
  attachments: File[];
}

/**
 * Register custom image upload handler with Unlayer
 * This ensures images are hosted on our domain, not blocked S3 URLs
 */
export function registerCustomImageUpload(unlayer: any) {
  console.log('[CustomImageUpload] Registering custom image handler');
  
  unlayer.registerCallback('image', async function(file: UnlayerFile, done: (result: UploadProgress) => void) {
    console.log('[CustomImageUpload] Image upload requested:', file);
    
    if (!file.attachments || file.attachments.length === 0) {
      console.error('[CustomImageUpload] No file provided');
      done({ progress: 100, url: '' });
      return;
    }

    const imageFile = file.attachments[0];
    console.log('[CustomImageUpload] Uploading file:', imageFile.name, 'Size:', imageFile.size);

    try {
      // Update progress
      done({ progress: 10 });

      // Create form data
      const formData = new FormData();
      formData.append('image', imageFile);

      // Upload to our API
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });

      done({ progress: 50 });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[CustomImageUpload] Upload successful:', result.url);

      // Return the URL hosted on our domain
      done({ 
        progress: 100, 
        url: result.url // This will be something like: https://yourdomain.com/uploads/image.jpg
      });

    } catch (error) {
      console.error('[CustomImageUpload] Upload failed:', error);
      
      // Fallback to a placeholder if upload fails
      done({ 
        progress: 100, 
        url: '/images/upload-failed.png'
      });
    }
  });
}

/**
 * Alternative: Use a CDN or image hosting service
 * This example uses Cloudinary (more reliable than S3 for emails)
 */
export function registerCloudinaryUpload(unlayer: any, cloudName: string, uploadPreset: string) {
  console.log('[CloudinaryUpload] Registering Cloudinary handler');
  
  unlayer.registerCallback('image', async function(file: UnlayerFile, done: (result: UploadProgress) => void) {
    if (!file.attachments || file.attachments.length === 0) {
      done({ progress: 100, url: '' });
      return;
    }

    const imageFile = file.attachments[0];
    
    try {
      done({ progress: 10 });

      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', uploadPreset);

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      done({ progress: 70 });

      const data = await response.json();
      console.log('[CloudinaryUpload] Upload successful:', data.secure_url);

      // Cloudinary URLs are trusted by email clients
      done({ 
        progress: 100, 
        url: data.secure_url
      });

    } catch (error) {
      console.error('[CloudinaryUpload] Upload failed:', error);
      done({ progress: 100, url: '' });
    }
  });
}