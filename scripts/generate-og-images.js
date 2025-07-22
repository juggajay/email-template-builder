const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// OG Image configurations
const ogImages = [
  {
    filename: 'og-image.png',
    title: 'ZebaMail',
    subtitle: 'Email Template Builder for Shopify',
    description: 'Boost Sales 34% with Professional Email Templates',
  },
  {
    filename: 'og-shopify-templates.png',
    title: 'Shopify Email Templates',
    subtitle: 'Professional Templates That Convert',
    description: 'Recover 28.3% of Abandoned Carts',
  },
  {
    filename: 'og-abandoned-cart.png',
    title: 'Abandoned Cart Templates',
    subtitle: 'Recover Lost Revenue',
    description: 'Average 28.3% Cart Recovery Rate',
  },
  {
    filename: 'og-converting-templates.png',
    title: 'Email Templates That Convert',
    subtitle: '34% Sales Increase',
    description: 'Based on 127M Emails Sent',
  },
  {
    filename: 'og-free-builder.png',
    title: 'Free Email Builder',
    subtitle: 'No Code Required',
    description: '5 Free Exports Monthly',
  },
];

async function generateOGImage(config) {
  // Create canvas (1200x630 is the recommended OG image size)
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, '#3B82F6'); // Primary blue
  gradient.addColorStop(1, '#1E40AF'); // Darker blue
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);

  // Add subtle pattern overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 20; i++) {
    ctx.fillRect(i * 60, 0, 30, 630);
  }

  // Logo/Brand area
  ctx.fillStyle = 'white';
  ctx.font = 'bold 32px Arial';
  ctx.fillText('ZebaMail', 80, 80);

  // Main title
  ctx.font = 'bold 64px Arial';
  ctx.fillText(config.title, 80, 280);

  // Subtitle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '36px Arial';
  ctx.fillText(config.subtitle, 80, 350);

  // Description
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '28px Arial';
  ctx.fillText(config.description, 80, 420);

  // Call to action visual
  ctx.fillStyle = 'white';
  ctx.fillRect(80, 480, 300, 60);
  ctx.fillStyle = '#1E40AF';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Start Free Trial →', 120, 520);

  // Save the image
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(__dirname, '..', 'public', config.filename);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated: ${config.filename}`);
}

// Generate all OG images
async function generateAllOGImages() {
  console.log('Generating Open Graph images...');
  
  for (const config of ogImages) {
    await generateOGImage(config);
  }
  
  console.log('All OG images generated successfully!');
}

// Note: This is a placeholder script. In production, you would:
// 1. Install canvas: npm install canvas
// 2. Run this script: node scripts/generate-og-images.js
// 3. Or use a service like Vercel OG Image Generation

console.log('OG Image Generation Script');
console.log('To generate images, install canvas: npm install canvas');
console.log('Then run: node scripts/generate-og-images.js');