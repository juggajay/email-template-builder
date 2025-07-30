# Email Images Not Showing - Root Cause Analysis

## Summary of Investigation

After extensive research and debugging, here's what I've discovered about why images aren't showing in sent emails:

## Key Findings

### 1. **Unlayer Export Behavior**
Based on research, Unlayer's `exportHtml()` may not always include images in the exported HTML if:
- Custom tools are used without proper exporter functions
- The `customJS` parameter is missing when calling exportHtml
- Images are handled as custom tools rather than standard image elements

### 2. **Current Implementation Issues**

#### In UnlayerWrapper (`src/components/editor/unlayer-wrapper.tsx`):
```javascript
editorRef.current.exportHtml((data: any) => {
  const { design, html } = data;
  // No export options being passed!
});
```

The export is called without any options, which might cause Unlayer to skip certain elements.

### 3. **What Unlayer Should Export**
When properly configured, Unlayer should export:
- Full HTML with `<img>` tags
- Images with their original URLs (e.g., from Unlayer's S3, Unsplash, etc.)
- Proper table-based layout for email compatibility

### 4. **Common Issues from Research**

1. **Missing Exporter Functions**: Custom tools need proper exporter functions
2. **JavaScript Accessibility**: Custom JS must be publicly accessible via HTTPS
3. **Export Options**: Not passing proper options to exportHtml
4. **Server-Side Processing**: Unlayer might need server-side processing for certain features

## Recommended Fix

### 1. Update the Export Function
Add proper export options when calling `exportHtml`:

```javascript
editorRef.current.exportHtml({
  cleanup: true,
  minify: false // Keep false for debugging
}, (data: any) => {
  const { design, html } = data;
  
  // Verify images are in the exported HTML
  console.log('Exported HTML contains images:', html.includes('<img'));
  console.log('Image count:', (html.match(/<img/g) || []).length);
  
  onSave(design, html);
});
```

### 2. Check Unlayer Configuration
Ensure the editor is initialized with all necessary features:

```javascript
unlayer.init({
  id: 'editor',
  displayMode: 'email',
  features: {
    userUploads: true,
    stockImages: true,
    imageEditor: true
  },
  tools: {
    image: {
      enabled: true
    }
  }
});
```

### 3. Debug Export Process
Add comprehensive logging to track:
1. What HTML Unlayer exports
2. What happens during sanitization
3. What the image processor does
4. What gets sent to the email service

## Next Steps

1. **Test Standalone**: Use the test file created (`test-unlayer-export-standalone.html`) to verify if Unlayer exports images
2. **Update Export Code**: Modify the export function to include proper options
3. **Add Logging**: Track the HTML through each step of the pipeline
4. **Verify with Simple Test**: Send a test email with a single image to isolate the issue

## Critical Question

**Are images missing from Unlayer's export, or are they being removed later in the pipeline?**

This needs to be answered definitively to fix the issue.