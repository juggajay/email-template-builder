-- Grant admin and beta access to specific email
UPDATE user_profiles 
SET role = 'admin', 
    is_beta_tester = true,
    beta_access_granted_at = COALESCE(beta_access_granted_at, NOW())
WHERE email = 'jaysonryan21@hotmail.com';

-- Also update the function to include the correct email
CREATE OR REPLACE FUNCTION auto_grant_beta_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-grant beta access to specific email domains and addresses
  IF NEW.email LIKE '%@zebamail.com' OR 
     NEW.email = 'jaysonryan21@hotmail.com' THEN
    NEW.is_beta_tester := true;
    NEW.beta_access_granted_at := NOW();
    
    -- Make zebamail.com emails and the owner admin by default
    IF NEW.email LIKE '%@zebamail.com' OR NEW.email = 'jaysonryan21@hotmail.com' THEN
      NEW.role := 'admin';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS auto_grant_beta_access_trigger ON user_profiles;
CREATE TRIGGER auto_grant_beta_access_trigger
BEFORE INSERT OR UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION auto_grant_beta_access();