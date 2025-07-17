# Quick Fix for Template Editor Issue

## The Problem
When you click a template, it goes to the editor but shows nothing because:
1. The editor page wasn't reading the template ID from the URL
2. Templates might not have JSON design data (only HTML)

## The Fix

### Step 1: Update Your Code
The editor page has been fixed to:
- Read the `template` parameter from the URL
- Load template data from the database
- Pass it to the email editor component

### Step 2: Run the SQL Fix
1. Go to Supabase SQL Editor
2. Copy and run the contents of `EDITOR_FIX.sql`
3. This will add JSON design data to templates that only have HTML

### Step 3: Restart Your Dev Server
```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

### Step 4: Test Again
1. Go to `/templates`
2. Click on any template
3. The editor should now load with the template content

## What Was Fixed
- ✅ Added `useSearchParams` to read URL parameters
- ✅ Added `loadTemplate` function to fetch template data
- ✅ Pass `initialDesign` to the EmailEditor component
- ✅ SQL script creates JSON design from HTML content

## Still Not Working?
Try these:
1. Clear browser cache: `Ctrl + Shift + R`
2. Check browser console for errors
3. Make sure you're logged in (some features require authentication)

The templates should now load properly in the editor!