-- Update the handle_new_user function to apply beta invite codes from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name, company_name, beta_invite_code)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'beta_invite_code'
  );
  
  -- If there's a beta invite code, try to apply it
  IF new.raw_user_meta_data->>'beta_invite_code' IS NOT NULL THEN
    PERFORM use_beta_invite(
      new.raw_user_meta_data->>'beta_invite_code',
      new.id
    );
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();