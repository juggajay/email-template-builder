-- Fix beta invite foreign key constraint to properly reference auth.users
-- Drop the existing foreign key constraint if it exists
ALTER TABLE beta_invites 
DROP CONSTRAINT IF EXISTS beta_invites_used_by_fkey;

-- Add the correct foreign key constraint to auth.users
ALTER TABLE beta_invites 
ADD CONSTRAINT beta_invites_used_by_fkey 
FOREIGN KEY (used_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Also update the created_by foreign key to reference auth.users
ALTER TABLE beta_invites 
DROP CONSTRAINT IF EXISTS beta_invites_created_by_fkey;

ALTER TABLE beta_invites 
ADD CONSTRAINT beta_invites_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Update the function to handle the user reference correctly
CREATE OR REPLACE FUNCTION use_beta_invite(invite_code TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  invite_record beta_invites%ROWTYPE;
  clean_code TEXT;
BEGIN
  -- Clean and uppercase the code
  clean_code := UPPER(TRIM(invite_code));
  
  -- Verify the user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RAISE EXCEPTION 'User not found in auth.users';
  END IF;
  
  -- Find the invite (case-insensitive)
  SELECT * INTO invite_record
  FROM beta_invites
  WHERE UPPER(code) = clean_code
  AND (expires_at IS NULL OR expires_at > now())
  AND uses_count < max_uses
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Update the invite
  UPDATE beta_invites
  SET 
    uses_count = uses_count + 1,
    used_at = CASE WHEN used_at IS NULL THEN now() ELSE used_at END,
    used_by = CASE WHEN used_by IS NULL THEN user_id ELSE used_by END
  WHERE id = invite_record.id;

  -- Mark user as beta tester
  UPDATE user_profiles
  SET 
    is_beta_tester = true,
    beta_access_granted_at = now(),
    beta_invite_code = clean_code
  WHERE user_profiles.user_id = user_id;

  -- If no user_profile exists yet, create one
  IF NOT FOUND THEN
    INSERT INTO user_profiles (user_id, is_beta_tester, beta_access_granted_at, beta_invite_code)
    VALUES (user_id, true, now(), clean_code)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      is_beta_tester = true,
      beta_access_granted_at = now(),
      beta_invite_code = clean_code;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, authenticated, service_role;
GRANT SELECT ON auth.users TO postgres, authenticated, service_role;