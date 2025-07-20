-- Grant beta access to existing users and make first user admin
-- This ensures the system owner can still login

-- Grant beta access to all existing users (grandfathering them in)
UPDATE user_profiles 
SET is_beta_tester = true,
    beta_access_granted_at = NOW()
WHERE is_beta_tester IS NULL OR is_beta_tester = false;

-- Make the first user (likely the owner) an admin
UPDATE user_profiles 
SET role = 'admin'
WHERE created_at = (
  SELECT MIN(created_at) 
  FROM user_profiles
) AND (role IS NULL OR role = 'user');

-- Optional: Grant admin role to specific email (replace with your email)
-- UPDATE user_profiles 
-- SET role = 'admin', is_beta_tester = true
-- WHERE email = 'your-email@example.com';

-- Create a function to auto-grant beta access to specific domains
CREATE OR REPLACE FUNCTION auto_grant_beta_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-grant beta access to specific email domains
  IF NEW.email LIKE '%@zebamail.com' OR 
     NEW.email = 'jaysonryan21@hotmail.com' THEN  -- Add your email here
    NEW.is_beta_tester := true;
    NEW.beta_access_granted_at := NOW();
    
    -- Make zebamail.com emails admin by default
    IF NEW.email LIKE '%@zebamail.com' THEN
      NEW.role := 'admin';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user profiles
DROP TRIGGER IF EXISTS auto_grant_beta_access_trigger ON user_profiles;
CREATE TRIGGER auto_grant_beta_access_trigger
BEFORE INSERT ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION auto_grant_beta_access();