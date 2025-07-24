import { createClient } from '@supabase/supabase-js';
import { seedTemplates, generateHTMLFromDesign, generateThumbnailUrl } from './src/lib/email-templates';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSeeding() {
  console.log('Testing abandoned cart template seeding...\n');
  
  const abandonedCartTemplates = seedTemplates.filter(t => t.category === 'abandoned-cart');
  console.log(`Found ${abandonedCartTemplates.length} abandoned cart templates to seed\n`);
  
  // Check existing templates
  const { data: existing, error: fetchError } = await supabase
    .from('email_templates')
    .select('name, category')
    .eq('category', 'abandoned-cart');
    
  if (fetchError) {
    console.error('Error fetching existing templates:', fetchError);
    return;
  }
  
  console.log(`Existing abandoned cart templates in DB: ${existing?.length || 0}`);
  if (existing && existing.length > 0) {
    existing.forEach(t => console.log(`  - ${t.name}`));
  }
  console.log('\n');
  
  // Try to insert each template individually
  for (const template of abandonedCartTemplates) {
    console.log(`Attempting to seed: ${template.name}`);
    
    const emailTemplate = {
      name: template.name,
      description: template.description,
      category: template.category,
      tags: template.tags,
      html_content: generateHTMLFromDesign(template.design),
      json_design: template.design,
      thumbnail_url: generateThumbnailUrl(template.name, template.thumbnail),
      is_public: true,
      is_premium: template.is_premium,
      created_by: null, // We'll use null for testing
      usage_count: template.usage_count,
      rating: template.rating
    };
    
    const { data, error } = await supabase
      .from('email_templates')
      .insert(emailTemplate)
      .select();
      
    if (error) {
      console.error(`  ❌ ERROR: ${error.message}`);
      console.error(`     Code: ${error.code}`);
      console.error(`     Details: ${JSON.stringify(error.details)}`);
    } else {
      console.log(`  ✅ Success! Template ID: ${data?.[0]?.id}`);
    }
    console.log();
  }
  
  // Check final count
  const { data: final, error: finalError } = await supabase
    .from('email_templates')
    .select('name')
    .eq('category', 'abandoned-cart');
    
  console.log(`\nFinal abandoned cart template count: ${final?.length || 0}`);
}

testSeeding().catch(console.error);