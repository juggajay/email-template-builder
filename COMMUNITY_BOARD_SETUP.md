# Community Board Setup Instructions

## Database Setup

Run these SQL commands in your Supabase SQL editor in this exact order:

### Step 1: Add Role Column
```sql
-- Add role column to user_profiles if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'beta_tester'));
```

### Step 2: Create Reddit-Style Schema
Copy and run the entire contents of `supabase-feedback-reddit-schema.sql`

This will create:
- `feedback_posts` table
- `feedback_comments` table  
- `post_votes` table
- `comment_votes` table
- `feedback_posts_with_user_info` view
- `feedback_comments_with_user_info` view
- All necessary triggers and functions

### Step 3: Test the Setup
1. Go to `/community` in your app
2. Create a test post
3. Try upvoting/downvoting
4. Add a comment

## Troubleshooting

### If you get 404 errors:
- Make sure you ran the SQL in the correct order
- Check that the views were created successfully
- Verify RLS policies are enabled

### If voting doesn't work:
- Ensure you're logged in
- Check that the vote triggers were created
- Verify the user has the proper permissions

## Optional: Set Admin Users
```sql
-- Make specific users admins (replace with actual emails)
UPDATE user_profiles SET role = 'admin' WHERE email IN ('admin@example.com');
```