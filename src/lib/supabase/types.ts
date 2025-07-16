export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          company_name: string | null
          brand_colors: Json
          logo_url: string | null
          subscription_tier: 'free' | 'pro' | 'agency'
          subscription_status: string
          stripe_customer_id: string | null
          usage_count: number
          usage_reset_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          brand_colors?: Json
          logo_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'agency'
          subscription_status?: string
          stripe_customer_id?: string | null
          usage_count?: number
          usage_reset_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          brand_colors?: Json
          logo_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'agency'
          subscription_status?: string
          stripe_customer_id?: string | null
          usage_count?: number
          usage_reset_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      email_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          category: 'abandoned-cart' | 'product-launch' | 'order-confirmation' | 'welcome' | 'promotional'
          tags: string[]
          html_content: string | null
          json_design: Json | null
          thumbnail_url: string | null
          is_public: boolean
          is_premium: boolean
          created_by: string | null
          usage_count: number
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: 'abandoned-cart' | 'product-launch' | 'order-confirmation' | 'welcome' | 'promotional'
          tags?: string[]
          html_content?: string | null
          json_design?: Json | null
          thumbnail_url?: string | null
          is_public?: boolean
          is_premium?: boolean
          created_by?: string | null
          usage_count?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: 'abandoned-cart' | 'product-launch' | 'order-confirmation' | 'welcome' | 'promotional'
          tags?: string[]
          html_content?: string | null
          json_design?: Json | null
          thumbnail_url?: string | null
          is_public?: boolean
          is_premium?: boolean
          created_by?: string | null
          usage_count?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_templates: {
        Row: {
          id: string
          user_id: string
          template_id: string
          name: string
          customizations: Json
          html_content: string | null
          json_design: Json | null
          last_modified: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_id: string
          name: string
          customizations?: Json
          html_content?: string | null
          json_design?: Json | null
          last_modified?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string
          name?: string
          customizations?: Json
          html_content?: string | null
          json_design?: Json | null
          last_modified?: string
          created_at?: string
        }
      }
      template_exports: {
        Row: {
          id: string
          user_id: string
          template_id: string | null
          export_type: 'html' | 'klaviyo' | 'mailchimp' | 'shopify' | 'omnisend'
          destination: string | null
          file_size: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_id?: string | null
          export_type: 'html' | 'klaviyo' | 'mailchimp' | 'shopify' | 'omnisend'
          destination?: string | null
          file_size?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string | null
          export_type?: 'html' | 'klaviyo' | 'mailchimp' | 'shopify' | 'omnisend'
          destination?: string | null
          file_size?: number | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          plan: 'free' | 'pro' | 'agency'
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          plan?: 'free' | 'pro' | 'agency'
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string | null
          plan?: 'free' | 'pro' | 'agency'
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}