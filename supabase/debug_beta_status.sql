-- Debug query to check beta invite status

-- 1. Check recent users and their beta status
SELECT 
  up.user_id,
  up.email,
  up.is_beta_tester,
  up.beta_invite_code,
  up.beta_access_granted_at,
  up.created_at,
  au.email_confirmed_at,
  au.raw_user_meta_data->>'beta_invite_code' as metadata_invite_code
FROM user_profiles up
JOIN auth.users au ON au.id = up.user_id
ORDER BY up.created_at DESC
LIMIT 10;

-- 2. Check beta invites usage
SELECT 
  code,
  uses_count,
  max_uses,
  expires_at,
  used_by,
  used_at
FROM beta_invites
ORDER BY created_at DESC;

-- 3. Check if the trigger is properly installed
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  proname as function_name
FROM pg_trigger
JOIN pg_proc ON pg_proc.oid = pg_trigger.tgfoid
WHERE tgrelid = 'auth.users'::regclass;