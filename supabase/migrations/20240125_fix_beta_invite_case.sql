-- Fix beta invite code case sensitivity
-- Update the function to handle case-insensitive codes

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

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the validation function too
CREATE OR REPLACE FUNCTION is_email_beta_allowed(email_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user already exists and is beta tester
  IF EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN auth.users u ON u.id = up.user_id
    WHERE u.email = email_address
    AND up.is_beta_tester = true
  ) THEN
    RETURN true;
  END IF;

  -- Check if there's a valid invite for this email (case-insensitive)
  IF EXISTS (
    SELECT 1 FROM beta_invites
    WHERE (LOWER(email) = LOWER(email_address) OR email IS NULL)
    AND (expires_at IS NULL OR expires_at > now())
    AND uses_count < max_uses
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;