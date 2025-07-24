// Simple test to check if there are any constraints preventing multiple abandoned cart templates
// Run with: NEXT_PUBLIC_SUPABASE_URL=your-url NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key npx tsx test-abandoned-cart-constraints.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConstraints() {
  console.log('Testing abandoned cart template constraints...\n');
  
  // First, check existing abandoned cart templates
  const { data: existing, error: fetchError } = await supabase
    .from('email_templates')
    .select('id, name, category, created_by')
    .eq('category', 'abandoned-cart')
    .order('created_at', { ascending: false });
  
  if (fetchError) {
    console.error('Error fetching templates:', fetchError);
    return;
  }
  
  console.log(`Found ${existing?.length || 0} abandoned cart templates:`);
  existing?.forEach(t => {
    console.log(`- ${t.name} (ID: ${t.id}, Created by: ${t.created_by || 'system'})`);
  });
  
  // Test inserting multiple abandoned cart templates with unique names
  console.log('\n\nTesting insertion of new abandoned cart templates...\n');
  
  const testTemplates = [
    {
      name: 'Test Abandoned Cart 1 - ' + Date.now(),
      description: 'Test template 1',
      category: 'abandoned-cart',
      tags: ['test'],
      html_content: '<html><body>Test 1</body></html>',
      json_design: { body: { rows: [] } },
      is_public: true,
      is_premium: false,
      usage_count: 0,
      rating: 5
    },
    {
      name: 'Test Abandoned Cart 2 - ' + Date.now() + 1,
      description: 'Test template 2',
      category: 'abandoned-cart',
      tags: ['test'],
      html_content: '<html><body>Test 2</body></html>',
      json_design: { body: { rows: [] } },
      is_public: true,
      is_premium: false,
      usage_count: 0,
      rating: 5
    }
  ];
  
  for (const template of testTemplates) {
    const { data, error } = await supabase
      .from('email_templates')
      .insert(template)
      .select();
    
    if (error) {
      console.error(`❌ Failed to insert "${template.name}":`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      if (error.details) {
        console.error(`   Details: ${JSON.stringify(error.details)}`);
      }
    } else {
      console.log(`✅ Successfully inserted "${template.name}" with ID: ${data?.[0]?.id}`);
    }
  }
  
  // Check final count
  const { data: final, error: finalError } = await supabase
    .from('email_templates')
    .select('id, name')
    .eq('category', 'abandoned-cart')
    .order('created_at', { ascending: false });
  
  console.log(`\n\nFinal abandoned cart template count: ${final?.length || 0}`);
  
  // Clean up test templates
  console.log('\nCleaning up test templates...');
  const { error: deleteError } = await supabase
    .from('email_templates')
    .delete()
    .like('name', 'Test Abandoned Cart%');
  
  if (deleteError) {
    console.error('Error cleaning up:', deleteError);
  } else {
    console.log('Test templates cleaned up successfully');
  }
}

testConstraints().catch(console.error);