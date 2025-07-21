-- Add role column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'beta_tester'));

-- Update existing admin users (you can add specific user emails here)
-- Example:
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'admin@zebamail.com';