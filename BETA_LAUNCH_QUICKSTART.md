# ZebaMail Beta Launch Quick Start Guide

## 🚀 Easiest Way to Launch Your 2-Week Beta Test

### Option 1: Bulk Invite Codes (Recommended for 10-50 testers)

1. **Login to your admin panel** at `https://zebamail.com/admin/beta-invites`
2. **Generate multiple codes at once** by creating codes with higher usage limits:
   - Create 5 codes with 10 uses each = 50 beta testers
   - Set expiration to 14 days from now
   - Share the same code with groups of testers

### Option 2: Direct Database Access (Fastest for specific emails)

Run this in Supabase SQL Editor:

```sql
-- Grant beta access to multiple specific emails at once
UPDATE user_profiles 
SET is_beta_tester = true,
    beta_access_granted_at = NOW()
WHERE email IN (
  'tester1@email.com',
  'tester2@email.com',
  'tester3@email.com'
  -- Add all your beta tester emails here
);
```

### Option 3: Environment Variable Bypass (Simplest for trusted testers)

Add to your `.env.local`:
```env
NEXT_PUBLIC_BETA_BYPASS_EMAILS=email1@example.com,email2@example.com,email3@example.com
```
Then redeploy. These emails won't need invite codes.

## 📋 Quick 2-Week Beta Launch Checklist

### Day 1: Setup (5 minutes)
- [ ] Choose your method above
- [ ] Create invite codes OR add emails to database/env
- [ ] Test with your own email first

### Day 1-2: Distribution
- [ ] Send invite emails using the template
- [ ] Share beta info page: `https://zebamail.com/beta`
- [ ] Monitor signups in admin panel

### Week 1: Active Monitoring
- [ ] Check `/admin/beta-invites` daily
- [ ] Respond to beta@zebamail.com emails
- [ ] Track feature usage

### Week 2: Prepare for Launch
- [ ] Collect feedback
- [ ] Fix critical issues
- [ ] Plan public launch

## 🎯 Recommended Approach for Your Beta

Since you're running a 2-week beta test, here's the simplest approach:

1. **Use the Admin Panel** to create 3-5 invite codes with multiple uses
2. **Share via email** using the provided template
3. **Monitor daily** through the admin panel

### Sample Distribution Plan:
- **Code 1**: `BETA-EARLY01` (20 uses) - For your most engaged users
- **Code 2**: `BETA-WEEK1` (30 uses) - For week 1 general access
- **Code 3**: `BETA-FINAL` (50 uses) - For final push

## 📧 Quick Email to Send

```
Subject: You're Invited: ZebaMail Beta Access 🦓

Hi [Name],

You're invited to test ZebaMail before anyone else!

Your invite code: BETA-EARLY01
Access link: https://zebamail.com/beta

This code expires in 14 days. Questions? Reply to this email.

Best,
[Your name]
```

## 🔗 Important Links

- **Admin Panel**: `/admin/beta-invites`
- **Beta Info Page**: `/beta`
- **Signup Page**: `/signup`
- **Support Email**: `beta@zebamail.com`

## ⚡ Super Quick Start (Under 2 minutes)

1. Go to `/admin/beta-invites`
2. Click "Create Invite"
3. Set max uses to 50, expiry to 14 days
4. Copy the code
5. Email it to your beta list

That's it! Your beta test is live.