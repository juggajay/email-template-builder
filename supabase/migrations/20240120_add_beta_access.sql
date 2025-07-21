-- Add beta tester access control
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS beta_access_granted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS beta_invite_code TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_beta_tester ON user_profiles(is_beta_tester) WHERE is_beta_tester = true;
CREATE INDEX IF NOT EXISTS idx_user_profiles_beta_invite_code ON user_profiles(beta_invite_code) WHERE beta_invite_code IS NOT NULL;

-- Create beta invites table
CREATE TABLE IF NOT EXISTS beta_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES auth.users(id),
  max_uses INTEGER DEFAULT 1,
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Create index for invite codes
CREATE INDEX IF NOT EXISTS idx_beta_invites_code ON beta_invites(code);
CREATE INDEX IF NOT EXISTS idx_beta_invites_email ON beta_invites(email);

-- Add RLS policies
ALTER TABLE beta_invites ENABLE ROW LEVEL SECURITY;

-- Only admins can view all invites
CREATE POLICY "Admins can view all beta invites" ON beta_invites
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Users can view their own invites
CREATE POLICY "Users can view their own beta invites" ON beta_invites
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() OR used_by = auth.uid());

-- Only admins can create invites
CREATE POLICY "Admins can create beta invites" ON beta_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Function to check if email is allowed for beta
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

  -- Check if there's a valid invite for this email
  IF EXISTS (
    SELECT 1 FROM beta_invites
    WHERE (email = email_address OR email IS NULL)
    AND (expires_at IS NULL OR expires_at > now())
    AND uses_count < max_uses
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use beta invite
CREATE OR REPLACE FUNCTION use_beta_invite(invite_code TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  invite_record beta_invites%ROWTYPE;
BEGIN
  -- Find the invite
  SELECT * INTO invite_record
  FROM beta_invites
  WHERE code = invite_code
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
    beta_invite_code = invite_code
  WHERE user_profiles.user_id = user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;