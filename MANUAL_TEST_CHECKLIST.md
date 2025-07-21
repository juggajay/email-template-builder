# Manual Test Checklist - Email Template Builder

Since automated browser testing requires system dependencies, please follow this manual test checklist to verify all functionality:

## Prerequisites
- [ ] Development server running (`npm run dev`)
- [ ] Supabase database accessible
- [ ] All SQL fixes applied (see below)

## SQL Fixes to Apply First
Run these in your Supabase SQL editor in order:
1. [ ] `supabase-schema-fixed-v2.sql` - Fixes SQL syntax errors
2. [ ] `supabase-complete-rls-fix.sql` - Fixes RLS policies
3. [ ] `TEMPLATE_FIX.sql` - Adds sample templates
4. [ ] Final fix from `COMPLETE_FIX_PACKAGE.md` lines 222-252

## Test Checklist

### 1. Landing Page (http://localhost:3000)
- [ ] Page loads without errors
- [ ] "E-commerce Email Template Builder" title is visible
- [ ] "Get Started" button is clickable
- [ ] "View Templates" button is clickable
- [ ] Quick access links work (Login, Dashboard, Editor, etc.)

### 2. Templates Page (http://localhost:3000/templates)
- [ ] Page loads without infinite spinner
- [ ] Template cards are visible
- [ ] Category filters work
- [ ] Search functionality works
- [ ] Clicking a template navigates to editor

### 3. Editor Page (http://localhost:3000/editor)
- [ ] Email editor loads
- [ ] When coming from templates, the template content loads
- [ ] Save button works
- [ ] Export button works
- [ ] Preview modes (desktop/tablet/mobile) work
- [ ] E-commerce tools are visible in sidebar

### 4. Authentication Pages
- [ ] Login page (http://localhost:3000/login)
  - [ ] Email and password fields present
  - [ ] Login button works
  - [ ] "Forgot password?" link works
- [ ] Signup page (http://localhost:3000/signup)
  - [ ] All form fields present
  - [ ] Signup creates user account
  - [ ] User profile is created automatically
- [ ] Password Reset (http://localhost:3000/reset-password)
  - [ ] Page loads (no more 404)
  - [ ] Email input works
  - [ ] Send reset link button works

### 5. Dashboard Pages (requires login)
- [ ] Dashboard (http://localhost:3000/dashboard)
  - [ ] Stats cards show (may be mock data)
  - [ ] Recent templates section visible
- [ ] Billing (http://localhost:3000/billing)
  - [ ] Pricing plans displayed
  - [ ] Upgrade buttons visible
- [ ] Settings (http://localhost:3000/settings)
  - [ ] Profile form loads
  - [ ] Save changes button present

### 6. Functionality Tests
- [ ] Create a new template
- [ ] Save a template
- [ ] Export a template
- [ ] Search for templates
- [ ] Filter templates by category
- [ ] Logout and login again

## Browser Console Checks
Open Developer Tools (F12) and check:
- [ ] No 406 errors (RLS issues)
- [ ] No 404 errors for missing pages
- [ ] No JavaScript errors blocking functionality

## Performance Checks
- [ ] Templates load within 3 seconds
- [ ] Editor loads within 5 seconds
- [ ] No infinite loading spinners

## Mobile Responsiveness
- [ ] Test on mobile viewport (use browser dev tools)
- [ ] Navigation menu works on mobile
- [ ] Forms are usable on mobile
- [ ] Editor has mobile preview mode

## Known Issues to Ignore
- Bybit browser extension errors
- CSP (Content Security Policy) warnings from Vercel
- These are external and don't affect functionality

## After Testing
If you find any issues:
1. Check browser console for errors
2. Verify SQL fixes were applied
3. Clear browser cache and cookies
4. Restart development server

## Success Criteria
- [ ] All pages load without errors
- [ ] Core functionality works (create, save, export templates)
- [ ] Authentication flow works
- [ ] No blocking errors in console

## Notes
______________________________________________________________________________
______________________________________________________________________________
______________________________________________________________________________
______________________________________________________________________________