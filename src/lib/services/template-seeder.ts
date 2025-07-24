import { createClient } from '@/lib/supabase/client';
import { seedTemplates, generateHTMLFromDesign, generateThumbnailUrl } from '@/lib/email-templates';
import type { EmailTemplate } from '@/types';

export interface SeedResult {
  success: boolean;
  templatesCreated: number;
  errors: string[];
}

export class TemplateSeeder {
  private supabase;
  
  constructor() {
    this.supabase = createClient();
  }
  
  async seedTemplates(): Promise<SeedResult> {
    const result: SeedResult = {
      success: true,
      templatesCreated: 0,
      errors: []
    };
    
    try {
      // Check if templates already exist
      const { data: existingTemplates, error: checkError } = await this.supabase
        .from('email_templates')
        .select('id')
        .limit(1);
      
      if (checkError) {
        throw new Error(`Failed to check existing templates: ${checkError.message}`);
      }
      
      if (existingTemplates && existingTemplates.length > 0) {
        const confirm = window.confirm(
          'Templates already exist in the database. Do you want to continue and add more templates?'
        );
        if (!confirm) {
          return {
            success: false,
            templatesCreated: 0,
            errors: ['Seeding cancelled by user']
          };
        }
      }
      
      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Process each template
      for (const template of seedTemplates) {
        try {
          const emailTemplate: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'> = {
            name: template.name,
            description: template.description,
            category: template.category,
            tags: template.tags,
            html_content: generateHTMLFromDesign(template.design),
            json_design: template.design,
            thumbnail_url: generateThumbnailUrl(template.name, template.thumbnail),
            is_public: true,
            is_premium: template.is_premium,
            created_by: user.id,
            usage_count: template.usage_count,
            rating: template.rating
          };
          
          const { error: insertError } = await this.supabase
            .from('email_templates')
            .insert(emailTemplate);
          
          if (insertError) {
            result.errors.push(`Failed to insert "${template.name}": ${insertError.message}`);
            result.success = false;
          } else {
            result.templatesCreated++;
          }
        } catch (error: any) {
          result.errors.push(`Error processing "${template.name}": ${error.message}`);
          result.success = false;
        }
      }
      
      return result;
    } catch (error: any) {
      return {
        success: false,
        templatesCreated: result.templatesCreated,
        errors: [error.message]
      };
    }
  }
  
  async clearAllTemplates(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('email_templates')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using impossible ID)
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  async getTemplateStats(): Promise<{
    totalTemplates: number;
    categoryCounts: Record<string, number>;
    premiumCount: number;
  }> {
    try {
      const { data: templates, error } = await this.supabase
        .from('email_templates')
        .select('category, is_premium');
      
      if (error) throw error;
      
      const stats = {
        totalTemplates: templates?.length || 0,
        categoryCounts: {} as Record<string, number>,
        premiumCount: 0
      };
      
      templates?.forEach((template: any) => {
        // Count by category
        if (template.category) {
          stats.categoryCounts[template.category] = 
            (stats.categoryCounts[template.category] || 0) + 1;
        }
        
        // Count premium templates
        if (template.is_premium) {
          stats.premiumCount++;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Failed to get template stats:', error);
      return {
        totalTemplates: 0,
        categoryCounts: {},
        premiumCount: 0
      };
    }
  }
}