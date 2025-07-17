// Quick script to check template loading without browser automation
const fetch = require('node-fetch');

async function checkTemplateLoading() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Checking Template Loading System\n');

  // Step 1: Check if templates API works
  console.log('1️⃣ Testing Templates API...');
  try {
    const response = await fetch(`${baseUrl}/api/templates`);
    const status = response.status;
    console.log(`   API Status: ${status}`);
    
    if (status === 200) {
      const data = await response.json();
      console.log(`   Templates found: ${data.templates?.length || 0}`);
      
      if (data.templates && data.templates.length > 0) {
        console.log('\n   Sample templates:');
        data.templates.slice(0, 3).forEach(t => {
          console.log(`   - ${t.name} (${t.category}) - Has design: ${!!t.json_design}`);
        });
      }
    } else if (status === 500) {
      const error = await response.json();
      console.log(`   ❌ API Error: ${error.error}`);
      console.log('   This is expected if Supabase tables don\'t exist');
    }
  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`);
  }

  // Step 2: Check editor page
  console.log('\n2️⃣ Testing Editor Page...');
  try {
    const response = await fetch(`${baseUrl}/editor`);
    console.log(`   Editor page status: ${response.status}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Step 3: Check templates page
  console.log('\n3️⃣ Testing Templates Gallery...');
  try {
    const response = await fetch(`${baseUrl}/templates`);
    console.log(`   Templates page status: ${response.status}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Step 4: Check if template designs module loads
  console.log('\n4️⃣ Checking Template Designs Module...');
  try {
    const { getTemplateDesign, templateDesigns } = require('./src/lib/template-designs');
    console.log(`   ✅ Template designs module loaded`);
    console.log(`   Available designs: ${Object.keys(templateDesigns).join(', ')}`);
    
    // Test design getter
    const testNames = ['Abandoned Cart Reminder', 'Welcome Series', 'Black Friday Sale'];
    console.log('\n   Testing design getter:');
    testNames.forEach(name => {
      const design = getTemplateDesign(name);
      const hasContent = design && design.body && design.body.rows && design.body.rows.length > 0;
      console.log(`   - "${name}": ${hasContent ? '✅ Has design' : '❌ No design'}`);
    });
  } catch (error) {
    console.log(`   ❌ Module error: ${error.message}`);
  }

  console.log('\n✅ Check complete!');
  console.log('\nTo fix template loading issues:');
  console.log('1. Ensure Supabase has template data with json_design field');
  console.log('2. Run UPDATE_TEMPLATE_DESIGNS.sql in Supabase');
  console.log('3. Check browser console for errors when clicking templates');
}

checkTemplateLoading().catch(console.error);