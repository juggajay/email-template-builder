# CRITICAL FIX: Email Images Not Displaying

## The Issue
User uploads images in Unlayer editor → Images don't show in sent emails → Just empty space where images should be

## Investigation Summary

### 1. **Checked Sanitization** ✅
- `sanitizeHtml()` does NOT remove `<img>` tags
- Only removes scripts, iframes, and event handlers

### 2. **Checked Image Processor** ✅  
- Fixed processor now preserves external images
- No longer replaces with placeholders

### 3. **THE REAL ISSUE: Unlayer Export**
Based on research, Unlayer's `exportHtml()` might not be including images in the exported HTML!

## Root Cause
When calling `exportHtml()`, we're not passing any options:
```javascript
editorRef.current.exportHtml((data: any) => {
  // No options passed!
});
```

## The Fix

### Step 1: Update Export Call
Add proper options to the export:

```javascript
editorRef.current.exportHtml({
  cleanup: true,
  minify: false
}, (data: any) => {
  const { design, html } = data;
  // Now images should be included
});
```

### Step 2: Add Verification
Log what's being exported to confirm images are present:

```javascript
console.log('HTML contains images:', html.includes('<img'));
console.log('Image count:', (html.match(/<img/g) || []).length);
```

### Step 3: Test the Flow
1. User adds image in editor
2. Export includes the image HTML
3. Image processor preserves it
4. Email service receives it
5. Image displays in email

## Implementation Steps

1. Update `handleExport` in `unlayer-wrapper.tsx`
2. Add export options
3. Add logging
4. Test with a simple image
5. Verify in received email

## Why This Happens
- Unlayer may require export options to include certain elements
- Without options, it might skip images or custom tools
- This is documented in Unlayer's troubleshooting guides

## Quick Test
Use `test-unlayer-export-standalone.html` to verify if Unlayer exports images with and without options.