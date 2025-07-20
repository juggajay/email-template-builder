UPDATE user_profiles 
SET role = 'admin',
    is_beta_tester = true,
    beta_access_granted_at = NOW()
WHERE email = 'jaysonryan21@hotmail.com';

SELECT email, role, is_beta_tester, beta_access_granted_at
FROM user_profiles
WHERE email = 'jaysonryan21@hotmail.com';