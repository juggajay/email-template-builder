# Complete Fix Package - Email Template Builder

## 🔧 All Issues and Fixes

### 1. Templates Loading Issue
**Problem**: Templates page shows spinner forever
**Solution**: Run this SQL to fix RLS and add templates

```sql
-- Fix 1: Allow public template viewing
DROP POLICY IF EXISTS "Anyone can view public templates" ON email_templates;
CREATE POLICY "Anyone can view public templates" ON email_templates
    FOR SELECT USING (true);

-- Fix 2: Ensure templates exist
INSERT INTO email_templates (name, description, category, tags, is_public, html_content)
SELECT 'Welcome Email', 'Professional welcome email', 'welcome'::template_category, 
       ARRAY['welcome'], true, '<html><body><h1>Welcome!</h1></body></html>'
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE is_public = true);
```

### 2. Editor Not Loading Templates
**Problem**: Clicking template opens empty editor
**Solution**: Already fixed in code - the editor now reads URL parameters

### 3. Authentication Issues
**Problem**: User profiles not created automatically
**Solution**: Run this SQL

```sql
-- Create missing profiles for all users
INSERT INTO user_profiles (user_id, email, full_name, subscription_tier)
SELECT id, email, split_part(email, '@', 1), 'free'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles);

-- Create missing subscriptions
INSERT INTO subscriptions (user_id, plan, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM subscriptions);
```

### 4. Missing Features to Implement

#### A. Password Reset Page
Create `src/app/(auth)/reset-password/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });
      
      if (error) throw error;
      setMessage('Check your email for the password reset link!');
    } catch (error) {
      setMessage('Error sending reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              Send Reset Link
            </Button>
            {message && (
              <p className="text-sm text-center text-gray-600">{message}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### B. Add Toast Notifications
Install react-hot-toast:
```bash
npm install react-hot-toast
```

Add to `src/app/layout.tsx`:
```typescript
import { Toaster } from 'react-hot-toast';

// In the body
<Toaster position="top-right" />
```

#### C. Fix Dashboard Data
Update `src/app/(dashboard)/dashboard/page.tsx` to use real data:

```typescript
const fetchDashboardStats = async () => {
  try {
    const supabase = createClient();
    
    // Get template count
    const { count: templateCount } = await supabase
      .from('email_templates')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user?.id);
    
    // Get export count
    const { count: exportCount } = await supabase
      .from('template_exports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id);
    
    // Get this month's exports
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { count: monthlyExports } = await supabase
      .from('template_exports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .gte('created_at', startOfMonth.toISOString());
    
    setStats({
      totalTemplates: templateCount || 0,
      totalExports: exportCount || 0,
      exportsThisMonth: monthlyExports || 0,
      recentTemplates: [], // Load separately
      popularTemplates: [] // Load separately
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
  } finally {
    setLoading(false);
  }
};
```

### 5. Performance Optimizations

```sql
-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_templates_public_category 
  ON email_templates(is_public, category) 
  WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_exports_user_month 
  ON template_exports(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_user_templates_modified 
  ON user_templates(user_id, last_modified DESC);
```

### 6. Fix Browser Console Errors
The errors you're seeing are from:
- **bybit**: Browser extension (can't fix)
- **CSP warnings**: Vercel security (normal)
- These don't affect functionality

## 🚀 Quick Start Commands

```bash
# 1. Restart your dev server
npm run dev

# 2. Clear browser cache
Ctrl + Shift + R

# 3. Test the app
http://localhost:3000
```

## ✅ Testing Checklist

- [ ] Landing page loads
- [ ] "Get Started" → Signup page
- [ ] "View Templates" → Templates page
- [ ] Templates load without spinner
- [ ] Clicking template → Editor with content
- [ ] Save template works
- [ ] Export template works
- [ ] Dashboard shows real data
- [ ] Settings page saves changes
- [ ] Billing page loads plans

## 🎯 Final SQL Script
Run this complete script in Supabase to fix everything:

```sql
-- Complete fix script
BEGIN;

-- 1. Fix RLS policies
DROP POLICY IF EXISTS "Anyone can view public templates" ON email_templates;
CREATE POLICY "Anyone can view public templates" ON email_templates
    FOR SELECT USING (true);

-- 2. Create missing user data
INSERT INTO user_profiles (user_id, email, full_name, subscription_tier)
SELECT id, email, split_part(email, '@', 1), 'free'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles);

INSERT INTO subscriptions (user_id, plan, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM subscriptions);

-- 3. Ensure templates exist
INSERT INTO email_templates (name, category, is_public, html_content)
VALUES 
  ('Welcome Email', 'welcome'::template_category, true, '<html><body><h1>Welcome!</h1></body></html>'),
  ('Cart Recovery', 'abandoned-cart'::template_category, true, '<html><body><h1>Complete Your Purchase</h1></body></html>')
ON CONFLICT DO NOTHING;

-- 4. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_templates_public ON email_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_exports_user ON template_exports(user_id);

COMMIT;
```