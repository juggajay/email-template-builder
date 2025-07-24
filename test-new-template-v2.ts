import { seedTemplates } from './src/lib/email-templates';

// Find the new templates
const abandonedCartTemplates = seedTemplates.filter(t => t.category === 'abandoned-cart');
const premiumRecovery = seedTemplates.find(t => t.name === 'Abandoned Cart - Premium Recovery');

console.log('✅ Template successfully added!');
console.log('\nAbandoned Cart Templates:', abandonedCartTemplates.length);
abandonedCartTemplates.forEach(t => {
  console.log(`- ${t.name} (Rating: ${t.rating}, Premium: ${t.is_premium})`);
});

console.log('\nTotal templates:', seedTemplates.length);

if (premiumRecovery) {
  console.log('\nNew Template Details:');
  console.log('- Design rows:', premiumRecovery.design.body.rows.length);
  console.log('- Has discount box:', premiumRecovery.design.body.rows.some((r: any) => r.id === 'discount-row'));
  console.log('- Has urgency message:', premiumRecovery.design.body.rows.some((r: any) => r.id === 'urgency-row'));
}