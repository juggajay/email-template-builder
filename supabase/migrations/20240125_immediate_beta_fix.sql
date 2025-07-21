-- Immediate fix for beta invite system
-- This creates a more robust version that handles missing user profiles

CREATE OR REPLACE FUNCTION use_beta_invite(invite_code TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  invite_record beta_invites%ROWTYPE;
  clean_code TEXT;
BEGIN
  -- Clean and uppercase the code
  clean_code := UPPER(TRIM(invite_code));
  
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

  -- First ensure user profile exists
  INSERT INTO user_profiles (user_id, is_beta_tester, beta_access_granted_at, beta_invite_code)
  VALUES (user_id, true, now(), clean_code)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_beta_tester = true,
    beta_access_granted_at = now(),
    beta_invite_code = clean_code;

  -- Update the invite
  UPDATE beta_invites
  SET 
    uses_count = uses_count + 1,
    used_at = CASE WHEN used_at IS NULL THEN now() ELSE used_at END,
    used_by = CASE WHEN used_by IS NULL THEN user_id ELSE used_by END
  WHERE id = invite_record.id;

  RETURN true;
EXCEPTION
  WHEN foreign_key_violation THEN
    -- If we still get a foreign key error, it means the user doesn't exist
    -- This shouldn't happen but let's handle it gracefully
    RAISE NOTICE 'User % does not exist in auth.users', user_id;
    RETURN false;
  WHEN OTHERS THEN
    -- Log any other errors but don't fail
    RAISE NOTICE 'Error in use_beta_invite: %', SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;