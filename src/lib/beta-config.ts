// Beta access configuration
export const BETA_CONFIG = {
  // Hardcoded bypass emails (always allowed)
  BYPASS_EMAILS: [
    'jaysonryan21@hotmail.com',
    'admin@zebamail.com',
  ],
  
  // Check if beta access is enabled
  IS_ENABLED: process.env.NEXT_PUBLIC_BETA_ACCESS_ENABLED !== 'false',
  
  // Check if an email should bypass beta restrictions
  shouldBypassBeta: (email: string): boolean => {
    // Always allow hardcoded emails
    if (BETA_CONFIG.BYPASS_EMAILS.includes(email)) {
      return true;
    }
    
    // Check environment variable for additional emails
    const envEmails = (process.env.NEXT_PUBLIC_BETA_BYPASS_EMAILS || '').split(',').map(e => e.trim());
    return envEmails.includes(email);
  }
};