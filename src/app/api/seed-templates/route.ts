import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { seedTemplates, generateHTMLFromDesign, generateThumbnailUrl } from '@/lib/email-templates';
import type { EmailTemplate } from '@/types';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin (you might want to implement proper role checking)
    // For now, we'll allow any authenticated user
    // In production, check user role or specific admin flag
    
    const body = await request.json();
    const { action, templateIndices } = body;
    
    switch (action) {
      case 'seed':
        return await handleSeed(supabase, user.id, templateIndices);
      case 'clear':
        return await handleClear(supabase);
      case 'stats':
        return await handleStats(supabase);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Seed templates error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSeed(supabase: any, userId: string, templateIndices?: number[]) {
  const result = {
    success: true,
    templatesCreated: 0,
    errors: [] as string[]
  };
  
  try {
    // Check if templates already exist
    const { data: existingTemplates, error: checkError } = await supabase
      .from('email_templates')
      .select('id')
      .limit(1);
    
    if (checkError) {
      throw new Error(`Failed to check existing templates: ${checkError.message}`);
    }
    
    // Determine which templates to process
    const templatesToSeed = templateIndices 
      ? seedTemplates.filter((_, index) => templateIndices.includes(index))
      : seedTemplates;
    
    if (templatesToSeed.length === 0) {
      return NextResponse.json({
        success: false,
        templatesCreated: 0,
        errors: ['No templates selected for seeding']
      }, { status: 400 });
    }
    
    // Process each selected template
    for (const template of templatesToSeed) {
      try {
        const emailTemplate: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'> = {
          name: template.name,
          description: template.description,
          category: template.category,
          tags: template.tags,
          html_content: generateHTMLFromDesign(template.design),
          json_design: template.design,
          thumbnail_url: generateThumbnailUrl(template.name),
          is_public: true,
          is_premium: template.is_premium,
          created_by: userId,
          usage_count: template.usage_count,
          rating: template.rating
        };
        
        const { error: insertError } = await supabase
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
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        templatesCreated: result.templatesCreated,
        errors: [error.message]
      },
      { status: 500 }
    );
  }
}

async function handleClear(supabase: any) {
  try {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using impossible ID)
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function handleStats(supabase: any) {
  try {
    const { data: templates, error } = await supabase
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
    
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}