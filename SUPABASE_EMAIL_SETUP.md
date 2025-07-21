# Supabase Email Configuration Guide

## Issue: Email Verification Not Sending

If users are not receiving email verification emails after signing up, follow these steps:

## 1. Check Supabase Dashboard Settings

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project (uvcebvlmufytjxiysbhr)
3. Navigate to **Authentication > Email Templates**

## 2. Verify Email Settings

In the Supabase Dashboard:

1. Go to **Settings > Auth**
2. Check the following settings:
   - **Enable Email Confirmations**: Should be ON
   - **Enable Email Sign-ups**: Should be ON
   - **Confirm Email**: Should be ON
   - **Auto-confirm Email**: Should be OFF (to require email verification)

## 3. Configure SMTP (If Using Custom Email Provider)

By default, Supabase uses their built-in email service which has rate limits. For production, configure custom SMTP:

1. Go to **Settings > Auth > SMTP Settings**
2. Enable custom SMTP and configure:
   - SMTP Host
   - SMTP Port
   - SMTP User
   - SMTP Password
   - Sender Email
   - Sender Name

## 4. Check Email Templates

1. Go to **Authentication > Email Templates**
2. Verify the **Confirm signup** template exists
3. Make sure the template includes the `.ConfirmationURL` variable

Default template should look like:
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

## 5. Check Rate Limits

Supabase's built-in email service has these limits:
- 3 emails per hour per user
- 30 emails per hour total

If you're hitting these limits, you need to configure custom SMTP.

## 6. Verify in Code

The signup code has been updated to include:
```typescript
options: {
  emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
}
```

This ensures the confirmation link redirects properly after verification.

## 7. Debug Steps

1. Check browser console for any errors during signup
2. Check Supabase Dashboard > Authentication > Users to see if user was created
3. Check the `confirmation_sent_at` field for the user
4. Check your spam folder

## 8. Common Issues

- **Email in spam**: Supabase default emails often go to spam
- **Rate limited**: Too many signups in short time
- **Email not enabled**: Email confirmations disabled in Supabase
- **Invalid redirect URL**: Make sure your site URL is configured in Supabase

## 9. Site URL Configuration

In Supabase Dashboard:
1. Go to **Settings > Auth**
2. Add your site URL to **Site URL** (e.g., https://yourdomain.com)
3. Add redirect URLs to **Redirect URLs**:
   - http://localhost:3000/auth/callback
   - https://yourdomain.com/auth/callback

## Need Help?

If emails still aren't sending:
1. Check Supabase status page
2. Contact Supabase support
3. Consider using a custom SMTP provider like SendGrid or Resend