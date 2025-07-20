# ZebaMail Beta Access Guide

## 🎯 How to Give Beta Access to Testers

### Method 1: Admin Panel (Easiest)
1. Login to ZebaMail as admin
2. Navigate to `/admin/beta-invites`
3. Create new invite codes with:
   - Email (optional - leave blank for general use)
   - Max uses (1 for individual, more for groups)
   - Expiration (optional)
   - Notes (to track who gets what)
4. Copy the generated code (format: `BETA-XXXXXXXX`)
5. Share with your beta testers

### Method 2: Direct Database Access
```sql
-- Grant beta access to existing user
UPDATE user_profiles 
SET is_beta_tester = true,
    beta_access_granted_at = NOW()
WHERE email = 'tester@example.com';

-- Create a new invite code manually
INSERT INTO beta_invites (code, email, max_uses, expires_at, created_by)
VALUES ('BETA-CUSTOM01', 'specific@email.com', 1, NOW() + INTERVAL '30 days', 'your-user-id');
```

### Method 3: Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_BETA_BYPASS_EMAILS=email1@example.com,email2@example.com
```

### Method 4: Disable Beta Restrictions
To temporarily allow all users:
```env
NEXT_PUBLIC_BETA_ACCESS_ENABLED=false
```

## 📧 Email Template for Beta Invites

Use the template in `beta-invite-email-template.html` and replace:
- `[NAME]` - Tester's name
- `[INVITE_CODE]` - Their unique beta code
- `[EXPIRY_DAYS]` - How many days until expiration
- `[MAX_USES]` - Number of times code can be used

## 🔗 Share These Links

- **Beta Info Page**: `https://yourdomain.com/beta`
- **Direct Signup**: `https://yourdomain.com/signup`
- **Support Email**: `beta@zebamail.com`

## 📝 Sample Message for Beta Testers

```
Hi [Name],

Welcome to ZebaMail Beta! 🦓

Your invite code: BETA-XXXXXXXX

To get started:
1. Go to https://zebamail.com/signup
2. Create your account
3. Enter your invite code when prompted
4. Start building amazing email templates!

This code expires in 30 days and can be used once.

Questions? Email us at beta@zebamail.com

Best,
The ZebaMail Team
```

## 🛡️ Managing Beta Access

### View All Invites
1. Go to `/admin/beta-invites`
2. See status of all codes (active/used/expired)
3. Track who used which codes

### Revoke Access
```sql
UPDATE user_profiles 
SET is_beta_tester = false
WHERE email = 'tester@example.com';
```

### Check Beta Status
```sql
SELECT email, is_beta_tester, beta_access_granted_at, beta_invite_code
FROM user_profiles
WHERE is_beta_tester = true
ORDER BY beta_access_granted_at DESC;
```

## 🚀 Quick Actions

### Grant Immediate Access (No Code Needed)
```sql
UPDATE user_profiles 
SET is_beta_tester = true,
    beta_access_granted_at = NOW()
WHERE email IN ('tester1@email.com', 'tester2@email.com');
```

### Create Bulk Invite Codes
```sql
-- Create 10 single-use codes
INSERT INTO beta_invites (code, max_uses, expires_at, created_by, notes)
SELECT 
  'BETA-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)),
  1,
  NOW() + INTERVAL '30 days',
  'your-user-id',
  'Batch created for beta launch'
FROM generate_series(1, 10);
```

### Export Active Beta Users
```sql
SELECT email, full_name, company_name, beta_access_granted_at
FROM user_profiles
WHERE is_beta_tester = true
ORDER BY beta_access_granted_at DESC;
```