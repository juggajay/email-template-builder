export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  tags: string[];
  html_content?: string;
  json_design?: Record<string, any>;
  thumbnail_url?: string;
  is_public: boolean;
  is_premium: boolean;
  created_by?: string;
  usage_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface UserTemplate {
  id: string;
  user_id: string;
  template_id: string;
  name: string;
  customizations: Record<string, any>;
  html_content?: string;
  json_design?: Record<string, any>;
  last_modified: string;
  created_at: string;
}

export interface TemplateExport {
  id: string;
  user_id: string;
  template_id: string;
  export_type: ExportType;
  destination?: string;
  file_size?: number;
  created_at: string;
}

export type TemplateCategory = 
  | 'abandoned-cart'
  | 'product-launch' 
  | 'order-confirmation'
  | 'welcome'
  | 'promotional';

export type ExportType = 
  | 'html'
  | 'klaviyo'
  | 'mailchimp'
  | 'shopify'
  | 'omnisend';

export interface EmailComponent {
  id: string;
  type: ComponentType;
  name: string;
  description: string;
  icon: string;
  properties: ComponentProperty[];
  default_values: Record<string, any>;
}

export type ComponentType = 
  | 'product-card'
  | 'product-grid'
  | 'discount-code'
  | 'countdown-timer'
  | 'shopping-cart-summary'
  | 'customer-reviews'
  | 'text'
  | 'image'
  | 'button'
  | 'divider';

export interface ComponentProperty {
  name: string;
  type: PropertyType;
  label: string;
  default: any;
  options?: string[];
  min?: number;
  max?: number;
  required?: boolean;
}

export type PropertyType = 
  | 'text'
  | 'number'
  | 'color'
  | 'select'
  | 'boolean'
  | 'image'
  | 'array';

export interface EmailPreview {
  mode: PreviewMode;
  width: number;
  height: number;
  dark_mode?: boolean;
}

export type PreviewMode = 'desktop' | 'mobile' | 'tablet';