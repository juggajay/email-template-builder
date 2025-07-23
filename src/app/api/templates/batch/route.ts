import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLoaders, clearLoaderCaches, primeLoaders } from '@/lib/api/dataloader';

/**
 * Example API route demonstrating DataLoader usage
 * GET /api/templates/batch?ids=id1,id2,id3
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];
    
    if (ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }
    
    // Create request-scoped loaders
    const supabase = createClient();
    const loaders = createLoaders(supabase);
    
    // Batch load templates - multiple calls will be batched together
    const templatePromises = ids.map(id => loaders.templateLoader.load(id));
    const templates = await Promise.all(templatePromises);
    
    // Filter out nulls and errors
    const validTemplates = templates.filter(t => t && !(t instanceof Error));
    
    return NextResponse.json({
      templates: validTemplates,
      requested: ids.length,
      found: validTemplates.length,
    });
  } catch (error) {
    console.error('Error in batch template API:', error);
    return NextResponse.json(
      { error: 'Failed to load templates' },
      { status: 500 }
    );
  }
}

/**
 * Example demonstrating how to use loaders with mutations
 * POST /api/templates/batch
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, updates } = body;
    
    if (!templateId || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const supabase = createClient();
    const loaders = createLoaders(supabase);
    
    // Load the template first (will be cached)
    const template = await loaders.templateLoader.load(templateId);
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    // Update the template
    const { data: updatedTemplate, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single();
      
    if (error) throw error;
    
    // Clear the cache for this template
    loaders.templateLoader.clear(templateId);
    
    // Prime the cache with the updated data
    primeLoaders(loaders, { templates: [updatedTemplate] });
    
    // Now if we load it again, it will use the primed data
    const cachedTemplate = await loaders.templateLoader.load(templateId);
    
    return NextResponse.json({
      template: cachedTemplate,
      updated: true,
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

/**
 * Example showing efficient loading of related data
 * GET /api/templates/with-users
 */
async function getTemplatesWithUsers(templateIds: string[]) {
  const supabase = createClient();
  const loaders = createLoaders(supabase);
  
  // Load all templates in parallel (batched)
  const templates = await Promise.all(
    templateIds.map(id => loaders.templateLoader.load(id))
  );
  
  // Extract unique user IDs from templates
  const userIds = Array.from(new Set(
    templates
      .filter(t => t && !(t instanceof Error) && t.created_by)
      .map(t => t!.created_by!)
  ));
  
  // Load all users in parallel (batched)
  const users = await Promise.all(
    userIds.map(id => loaders.userLoader.load(id))
  );
  
  // Combine the data
  const templatesWithUsers = templates.map(template => {
    if (!template || template instanceof Error) return null;
    
    const user = template.created_by 
      ? users.find(u => u && !(u instanceof Error) && u.id === template.created_by)
      : null;
      
    return {
      ...template,
      creator: user || null,
    };
  }).filter(Boolean);
  
  return templatesWithUsers;
}