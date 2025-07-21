# Template Visibility Fix

## Issues Identified

1. **Editor not visible without template** - Fixed by loading blank design
2. **Templates not showing** - Database/permission issue causing API 500 error
3. **Mock templates working** - Confirms frontend is OK, backend is the issue

## Solutions Applied

### 1. Editor Visibility Fix
Updated `unlayer-wrapper.tsx` to load a blank design when no template is selected:
```javascript
// Load a minimal blank design to ensure editor is visible
const blankDesign = {
  body: {
    id: '',
    rows: [],
    headers: [],
    footers: [],
    values: { ... }
  },
  schemaVersion: 8
};
```

### 2. Template Debug Page
Created `/test-templates` page to diagnose database issues:
- Shows total template count
- Lists all templates (with and without filters)
- Shows any database errors
- Provides test links

### 3. Database Fixes Required

The Templates API is returning 500 error, which means:
- Database connection might be failing
- RLS (Row Level Security) policies might be blocking access
- Supabase credentials might be missing/invalid

## Next Steps

1. **Check Environment Variables**
   - Ensure `.env.local` has valid Supabase credentials
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Run SQL to Add Templates**
   ```sql
   -- Run the TEMPLATE_FIX.sql file in Supabase SQL editor
   ```

3. **Check RLS Policies**
   ```sql
   -- Ensure public templates are readable
   DROP POLICY IF EXISTS "Anyone can view public templates" ON email_templates;
   CREATE POLICY "Anyone can view public templates" ON email_templates
       FOR SELECT USING (is_public = true);
   ```

4. **Test Links**
   - `/test-templates` - Debug page
   - `/templates` - Gallery (uses mock templates as fallback)
   - `/editor` - Blank editor
   - `/editor?template=mock-1` - Editor with mock template

## Current State

✅ **Working:**
- Editor now shows blank state when no template selected
- Mock templates display correctly
- Template preview functionality
- Editor loads templates when selected

❌ **Not Working:**
- Database templates not loading (500 error)
- Need valid Supabase connection

## Temporary Solution

The app is currently using mock templates as fallback, so it's fully functional even without database connection. Users can:
- Browse 5 mock templates
- Click to load them in editor
- Edit and export templates
- Save requires authentication