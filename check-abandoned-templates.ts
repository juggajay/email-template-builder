import { seedTemplates } from './src/lib/email-templates';

const abandonedCartTemplates = seedTemplates.filter(t => t.category === 'abandoned-cart');

console.log('Found', abandonedCartTemplates.length, 'abandoned cart templates\n');

abandonedCartTemplates.forEach((template, index) => {
  console.log(`\n${index + 1}. ${template.name}`);
  console.log('   Description:', template.description.substring(0, 80) + '...');
  console.log('   Rating:', template.rating);
  console.log('   Premium:', template.is_premium);
  console.log('   Tags:', template.tags.join(', '));
  
  // Check design structure
  if (template.design?.body) {
    console.log('   Design structure:');
    console.log('   - Body ID:', template.design.body.id);
    console.log('   - Rows:', template.design.body.rows?.length || 0);
    console.log('   - Schema version:', template.design.schemaVersion);
    console.log('   - Background color:', template.design.body.values?.backgroundColor || 'none');
    
    // Check first row content to see differences
    if (template.design.body.rows?.[0]) {
      const firstRow = template.design.body.rows[0];
      console.log('   - First row ID:', firstRow.id);
      const firstContent = firstRow.columns?.[0]?.contents?.[0];
      if (firstContent) {
        console.log('   - First content type:', firstContent.type);
        if (firstContent.type === 'text' || firstContent.type === 'heading') {
          console.log('   - First text:', (firstContent.values?.text || '').substring(0, 60) + '...');
        }
      }
    }
  }
  
  // Check if thumbnail is unique
  console.log('   Thumbnail:', template.thumbnail || 'default');
});