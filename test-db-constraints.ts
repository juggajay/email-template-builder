import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseConstraints() {
  console.log('Checking database constraints on email_templates table...\n');
  
  try {
    // Check table structure
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'email_templates' });
    
    if (columnsError) {
      console.log('Could not fetch column info via RPC, trying alternative method...');
    } else if (columns) {
      console.log('Table columns:', columns);
    }
    
    // Try to query pg_catalog for constraints
    const constraintQuery = `
      SELECT 
        con.conname AS constraint_name,
        con.contype AS constraint_type,
        pg_get_constraintdef(con.oid) AS constraint_definition
      FROM pg_constraint con
      JOIN pg_namespace nsp ON nsp.oid = con.connamespace
      JOIN pg_class cls ON cls.oid = con.conrelid
      WHERE cls.relname = 'email_templates'
        AND nsp.nspname = 'public';
    `;
    
    // Try to check indexes
    const indexQuery = `
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'email_templates'
        AND schemaname = 'public';
    `;
    
    // Test inserting duplicate names
    console.log('\nTesting duplicate name insertion...');
    
    const testTemplate = {
      name: 'Test Duplicate Name',
      description: 'Testing for unique constraint',
      category: 'abandoned-cart',
      tags: ['test'],
      html_content: '<html><body>Test</body></html>',
      json_design: { body: { rows: [] } },
      is_public: true,
      is_premium: false,
      usage_count: 0,
      rating: 5
    };
    
    // First insertion
    const { data: first, error: firstError } = await supabase
      .from('email_templates')
      .insert(testTemplate)
      .select();
    
    if (firstError) {
      console.log('First insertion failed:', firstError.message);
    } else {
      console.log('First insertion succeeded, ID:', first?.[0]?.id);
      
      // Try second insertion with same name
      const { data: second, error: secondError } = await supabase
        .from('email_templates')
        .insert(testTemplate)
        .select();
      
      if (secondError) {
        console.log('Second insertion failed (expected if unique constraint):', secondError.message);
        console.log('Error code:', secondError.code);
        console.log('Error details:', JSON.stringify(secondError.details));
      } else {
        console.log('Second insertion succeeded (no unique constraint on name), ID:', second?.[0]?.id);
      }
      
      // Clean up test data
      await supabase
        .from('email_templates')
        .delete()
        .eq('name', 'Test Duplicate Name');
    }
    
    // Check for any triggers
    console.log('\nChecking for triggers on email_templates...');
    const { data: templates, error: templatesError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('category', 'abandoned-cart')
      .limit(10);
    
    if (templatesError) {
      console.log('Error fetching templates:', templatesError);
    } else {
      console.log(`\nFound ${templates?.length || 0} abandoned-cart templates in database`);
      templates?.forEach(t => {
        console.log(`- ${t.name} (ID: ${t.id})`);
      });
    }
    
  } catch (error) {
    console.error('Error checking constraints:', error);
  }
}

checkDatabaseConstraints().catch(console.error);