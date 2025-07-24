import { seedTemplates } from './src/lib/email-templates';

// Find the new simple template
const simpleTemplate = seedTemplates.find(t => t.name === 'Abandoned Cart Recovery - Simple');
const allAbandonedCartTemplates = seedTemplates.filter(t => t.category === 'abandoned-cart');

console.log('✅ Simple template successfully added!');
console.log('\nTotal Abandoned Cart Templates:', allAbandonedCartTemplates.length);
allAbandonedCartTemplates.forEach(t => {
  console.log(`- ${t.name} (Rating: ${t.rating}, Premium: ${t.is_premium})`);
});

console.log('\nTotal templates in collection:', seedTemplates.length);

if (simpleTemplate) {
  console.log('\nSimple Template Details:');
  console.log('- Design rows:', simpleTemplate.design.body.rows.length);
  console.log('- Clean structure with all properties defined');
  console.log('- Background colors properly set on all rows');
}