-- Add thumbnail URLs to email templates
-- These are placeholder images that represent each template category

-- Abandoned Cart Templates
UPDATE email_templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=400&fit=crop'
WHERE category = 'abandoned-cart' AND thumbnail_url IS NULL;

-- Welcome Templates  
UPDATE email_templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1576669801820-0d4f7a6c8c6a?w=600&h=400&fit=crop'
WHERE category = 'welcome' AND thumbnail_url IS NULL;

-- Order Confirmation Templates
UPDATE email_templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=600&h=400&fit=crop'
WHERE category = 'order-confirmation' AND thumbnail_url IS NULL;

-- Product Launch Templates
UPDATE email_templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop'
WHERE category = 'product-launch' AND thumbnail_url IS NULL;

-- Promotional Templates
UPDATE email_templates 
SET thumbnail_url = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=400&fit=crop'
WHERE category = 'promotional' AND thumbnail_url IS NULL;

-- Alternative: Generate SVG data URLs for each category
-- This approach doesn't require external images

-- Abandoned Cart SVG
UPDATE email_templates 
SET thumbnail_url = 'data:image/svg+xml;base64,' || encode(
  '<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="400" fill="#f8f9fa"/>
    <rect x="50" y="50" width="500" height="300" fill="white" stroke="#dee2e6" stroke-width="2" rx="8"/>
    <rect x="80" y="100" width="120" height="120" fill="#e9ecef" rx="4"/>
    <text x="140" y="170" text-anchor="middle" font-family="Arial" font-size="60" fill="#6c757d">🛒</text>
    <rect x="220" y="120" width="300" height="20" fill="#e9ecef" rx="4"/>
    <rect x="220" y="160" width="200" height="20" fill="#e9ecef" rx="4"/>
    <rect x="220" y="200" width="100" height="30" fill="#007bff" rx="4"/>
    <text x="270" y="220" text-anchor="middle" font-family="Arial" font-size="14" fill="white">Complete Order</text>
  </svg>'::bytea, 'base64')
WHERE category = 'abandoned-cart' 
  AND thumbnail_url IS NULL 
  AND false; -- Set to true to use SVG instead of photos

-- Check results
SELECT category, COUNT(*) as count, 
       COUNT(CASE WHEN thumbnail_url IS NOT NULL THEN 1 END) as has_thumbnail
FROM email_templates
GROUP BY category
ORDER BY category;