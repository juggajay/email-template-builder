import { seedTemplates, generateThumbnailUrl } from './src/lib/email-templates';

console.log('Testing thumbnail fix for abandoned cart templates...\n');

const abandonedCartTemplates = seedTemplates.filter(t => t.category === 'abandoned-cart');

console.log(`Found ${abandonedCartTemplates.length} abandoned cart templates:\n`);

abandonedCartTemplates.forEach((template, index) => {
  console.log(`${index + 1}. ${template.name}`);
  console.log(`   Thumbnail property: ${template.thumbnail || 'none'}`);
  console.log(`   Generated URL: ${generateThumbnailUrl(template.name, template.thumbnail)}`);
  console.log(`   Unique: ${template.thumbnail ? 'YES ✓' : 'NO ✗ (will use placeholder)'}`);
  console.log();
});

// Check if all templates with thumbnails have unique URLs
const thumbnailUrls = abandonedCartTemplates
  .filter(t => t.thumbnail)
  .map(t => t.thumbnail);

const uniqueUrls = new Set(thumbnailUrls);
console.log(`\nUnique thumbnail URLs: ${uniqueUrls.size} out of ${thumbnailUrls.length}`);

if (uniqueUrls.size === thumbnailUrls.length) {
  console.log('✅ All abandoned cart templates have unique thumbnails!');
} else {
  console.log('❌ Some templates share the same thumbnail URL');
}