import { seedTemplates, generateHTMLFromDesign } from './src/lib/email-templates';

console.log('Testing template processing fix...\n');

// Find the problematic template
const premiumTemplate = seedTemplates.find(t => t.name === 'Premium Abandoned Cart Recovery');

if (premiumTemplate) {
  console.log('Found Premium Abandoned Cart Recovery template');
  console.log('Template structure:');
  console.log('- Has body:', !!premiumTemplate.design.body);
  console.log('- Row count:', premiumTemplate.design.body?.rows?.length || 0);
  
  try {
    console.log('\nGenerating HTML...');
    const html = generateHTMLFromDesign(premiumTemplate.design);
    console.log('✅ HTML generated successfully!');
    console.log('- HTML length:', html.length, 'characters');
    console.log('- Contains button:', html.includes('<a href='));
    console.log('- Contains image:', html.includes('<img src='));
    console.log('- Contains heading:', html.includes('<h'));
    console.log('- Contains html content:', html.includes('style="padding:'));
    
    // Test all templates
    console.log('\n\nTesting all templates...');
    let successCount = 0;
    let errorCount = 0;
    
    seedTemplates.forEach((template, index) => {
      try {
        const templateHtml = generateHTMLFromDesign(template.design);
        successCount++;
        console.log(`✅ ${index + 1}. ${template.name} - OK (${templateHtml.length} chars)`);
      } catch (error: any) {
        errorCount++;
        console.log(`❌ ${index + 1}. ${template.name} - ERROR: ${error.message}`);
      }
    });
    
    console.log(`\n\nSummary: ${successCount} successful, ${errorCount} errors`);
    
  } catch (error: any) {
    console.log('❌ Error generating HTML:', error.message);
    console.log('Stack:', error.stack);
  }
} else {
  console.log('❌ Premium Abandoned Cart Recovery template not found');
}