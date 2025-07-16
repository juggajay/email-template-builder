export * from './email';
export * from './user';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface SearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  sort?: SortOption;
  page?: number;
  per_page?: number;
}

export type SortOption = 
  | 'newest'
  | 'oldest'
  | 'popular'
  | 'rating'
  | 'name_asc'
  | 'name_desc';

export interface FilterOptions {
  categories: string[];
  tags: string[];
  is_premium?: boolean;
  rating_min?: number;
}

export interface EmailProvider {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  auth_url?: string;
  config?: Record<string, any>;
}

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  status: IntegrationStatus;
  config: Record<string, any>;
  last_sync?: string;
  created_at: string;
}

export type IntegrationType = 
  | 'email_platform'
  | 'ecommerce_platform'
  | 'crm'
  | 'analytics';

export type IntegrationStatus = 
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'pending';

export interface NotificationPreferences {
  email_updates: boolean;
  marketing_emails: boolean;
  usage_alerts: boolean;
  security_alerts: boolean;
}

export interface BillingInfo {
  stripe_customer_id: string;
  payment_method?: {
    type: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface DashboardStats {
  total_templates: number;
  total_exports: number;
  exports_this_month: number;
  popular_categories: Array<{
    category: string;
    count: number;
  }>;
  recent_activity: Array<{
    id: string;
    type: 'template_created' | 'template_exported' | 'template_shared';
    description: string;
    timestamp: string;
  }>;
}