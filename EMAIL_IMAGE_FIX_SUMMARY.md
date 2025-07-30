# Email Image Fix Summary

## Problem
When creating a template and sending a test email, images in the template were not rendering in the received emails.

## Root Cause
The email sending routes (`/api/email/send` and `/api/email/test`) were not processing images before sending. Images with relative URLs (e.g., `/uploads/image.jpg`) need to be converted to absolute URLs (e.g., `https://app.zebamail.com/uploads/image.jpg`) for email clients to display them correctly.

## Solution Implemented

### 1. Updated Email Send Route
- Added import for `processEmailImages` from the image processor
- Process all images in the HTML to ensure they have absolute URLs before sending
- Added logging to track image processing

**File:** `/src/app/api/email/send/route.ts`
```typescript
// Process images to ensure they have absolute URLs
const processedResult = processEmailImages(sanitizedHtml, {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://app.zebamail.com',
  logDetails: true
});

// Send the processed HTML
const result = await emailService.sendEmail({
  // ...
  content: {
    subject,
    html: processedResult.html  // Use processed HTML instead of raw HTML
  },
  // ...
});
```

### 2. Updated Test Email Route
- Added the same image processing logic to the test email endpoint
- Added detailed logging for debugging

**File:** `/src/app/api/email/test/route.ts`
```typescript
// Process images before sending test email
const processedResult = processEmailImages(html, {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://app.zebamail.com',
  logDetails: true
});

// Use processedResult.html for sending
```

## How the Image Processor Works

The `processEmailImages` function handles:
1. **Relative URLs** (`/uploads/image.jpg`) → `https://app.zebamail.com/uploads/image.jpg`
2. **Protocol-relative URLs** (`//cdn.example.com/image.jpg`) → `https://cdn.example.com/image.jpg`
3. **CSS background images** → Converts URLs in inline styles
4. **Srcset attributes** → Processes responsive image URLs
5. **Data URLs** → Leaves base64 images unchanged
6. **Already absolute URLs** → Leaves them unchanged

## Testing the Fix

### Method 1: Using Docker and Playwright
```bash
# Run the comprehensive test
./test-email-images-docker.sh
```

This test will:
- Start the app in Docker
- Create a template with images
- Send a test email
- Verify images are processed correctly

### Method 2: Manual Testing
1. Start the app: `docker-compose up`
2. Log in and go to the editor
3. Add an image block to your template
4. Send a test email
5. Check the server logs for:
   ```
   [Test Email] Processing images: X images found
   [ImageProcessor] Image 1: Root-relative URL converted
   ```

### Method 3: Simple API Test
```bash
# Run the simple test
node test-email-fix-simple.js
```

## Verification Checklist

✅ **Server Logs** - Look for image processing logs when sending emails:
- `[Test Email] Processing images: 3 images found`
- `[ImageProcessor] Image 1: Root-relative URL converted`

✅ **Email Client** - Images should now display correctly in:
- Gmail
- Outlook
- Apple Mail
- Other email clients

✅ **Exported HTML** - Check that exported HTML contains absolute URLs:
```html
<!-- Before -->
<img src="/uploads/logo.png">

<!-- After -->
<img src="https://app.zebamail.com/uploads/logo.png">
```

## Configuration

The base URL for image processing is determined by:
1. `process.env.NEXT_PUBLIC_SITE_URL` (if set)
2. Default: `https://app.zebamail.com`

To use a different base URL, set the environment variable:
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Future Improvements

1. **Image Hosting** - Consider uploading images to a CDN instead of serving from the app
2. **Image Optimization** - Automatically optimize images for email (resize, compress)
3. **Fallback Images** - Add alt text and fallback content for blocked images
4. **Image Validation** - Warn users if images are too large or in unsupported formats

## Troubleshooting

If images still don't appear:
1. Check browser console for CORS errors
2. Verify the base URL is correct in environment variables
3. Check if images are accessible publicly (not behind authentication)
4. Ensure image URLs don't contain special characters that need encoding
5. Check email client settings (some block images by default)