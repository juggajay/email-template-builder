/**
 * Service Configuration
 * Handles optional services gracefully
 */

export const services = {
  stripe: {
    enabled: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  },
  
  email: {
    sendgrid: {
      enabled: !!process.env.SENDGRID_API_KEY,
      apiKey: process.env.SENDGRID_API_KEY
    },
    resend: {
      enabled: !!process.env.RESEND_API_KEY,
      apiKey: process.env.RESEND_API_KEY
    }
  },
  
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  }
};

// Check if at least one email service is configured
export const hasEmailService = services.email.sendgrid.enabled || services.email.resend.enabled;

// Validation for required services
export function validateRequiredServices() {
  const errors: string[] = [];
  
  if (!services.supabase.url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  }
  
  if (!services.supabase.anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }
  
  return errors;
}