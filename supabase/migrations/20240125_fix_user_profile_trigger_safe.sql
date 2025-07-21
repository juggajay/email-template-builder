-- First, check if the beta_invite_code column exists, if not add it
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS beta_invite_code TEXT;

-- Update the handle_new_user function to apply beta invite codes from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  invite_code TEXT;
BEGIN
  -- Get the invite code from metadata
  invite_code := new.raw_user_meta_data->>'beta_invite_code';
  
  -- Insert the user profile
  INSERT INTO public.user_profiles (user_id, email, full_name, company_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'company_name'
  );
  
  -- If there's a beta invite code, try to apply it
  IF invite_code IS NOT NULL AND invite_code != '' THEN
    -- Try to use the invite code
    BEGIN
      PERFORM use_beta_invite(invite_code, new.id);
    EXCEPTION WHEN OTHERS THEN
      -- Log but don't fail if invite code fails
      RAISE NOTICE 'Failed to apply invite code % for user %: %', invite_code, new.id, SQLERRM;
    END;
  END IF;
  
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- If anything fails, log the error but don't prevent user creation
  RAISE NOTICE 'Error in handle_new_user for %: %', new.email, SQLERRM;
  -- Try minimal insert
  BEGIN
    INSERT INTO public.user_profiles (user_id, email)
    VALUES (new.id, new.email);
  EXCEPTION WHEN OTHERS THEN
    -- Even minimal insert failed, just log
    RAISE NOTICE 'Failed to create user profile for %: %', new.email, SQLERRM;
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();