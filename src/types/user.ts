export interface User {
  id: string;
  email?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  brand_colors: BrandColors;
  logo_url?: string;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  stripe_customer_id?: string;
  usage_count: number;
  usage_reset_date: string;
  created_at: string;
  updated_at: string;
  role?: 'user' | 'admin';
  is_beta_tester?: boolean;
  beta_access_granted_at?: string;
  beta_invite_code?: string;
}

export interface BrandColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
}

export type SubscriptionTier = 'free' | 'pro' | 'agency';

export type SubscriptionStatus = 
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id?: string;
  plan: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsageAnalytics {
  id: string;
  user_id: string;
  month: string;
  exports_count: number;
  storage_used: number;
  created_at: string;
}

export interface UserSession {
  user: User;
  profile: UserProfile;
  subscription: Subscription;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
}