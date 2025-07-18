# Vercel Deployment Checklist

## Pre-Deployment Steps

### 1. Required Environment Variables in Vercel
Go to your Vercel project → Settings → Environment Variables and add:

#### Essential Variables (Required)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep secret!)
- [ ] `NEXT_PUBLIC_APP_URL` - Your Vercel app URL (e.g., https://your-app.vercel.app)

#### Email Service (At least one required)
- [ ] `RESEND_API_KEY` - If using Resend
- [ ] `SENDGRID_API_KEY` - If using SendGrid
- [ ] `DEFAULT_FROM_EMAIL` - Default sender email
- [ ] `DEFAULT_FROM_NAME` - Default sender name

### 2. Database Setup
Run this migration in your Supabase SQL editor:
```sql
-- Run the migration from: supabase/migrations/20240118_security_logs_table.sql
```

### 3. Verify Deployment
After pushing to GitHub:
1. Check Vercel deployment logs for any errors
2. Visit your deployed URL
3. Test basic functionality:
   - [ ] Can access the homepage
   - [ ] Can navigate to /login
   - [ ] Security headers are working (check browser DevTools)

## Common Issues & Solutions

### "Module not found" errors
- Make sure all dependencies are in `package.json` (not devDependencies)

### "Environment variable not found" errors
- Double-check all required variables are set in Vercel
- Ensure you're using the correct environment (Production)

### Database connection errors
- Verify Supabase URL and keys are correct
- Check if security_logs table was created

### Email sending errors
- Ensure at least one email service is configured
- Verify API keys are valid

## Services Status (Without Configuration)

### ✅ Working without configuration:
- User authentication (Supabase Auth)
- Template management
- Security features (rate limiting, validation)
- Basic app functionality

### ⚠️ Disabled without configuration:
- **Stripe**: Payment/billing features (returns 501 Not Implemented)
- **Email**: Sending emails (requires Resend or SendGrid)
- **Shopify**: E-commerce integration (optional)

## Post-Deployment

1. Monitor the Vercel Functions logs for any runtime errors
2. Check that rate limiting is working (security feature)
3. Verify CSP headers aren't blocking required resources

## Quick Test Commands

Test your deployment:
```bash
# Check if API is responding
curl https://your-app.vercel.app/api/health

# Check security headers
curl -I https://your-app.vercel.app
```