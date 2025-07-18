# Enhanced Merge Tags Implementation

## Overview
Implemented comprehensive merge tags for e-commerce email personalization with 48+ dynamic variables across 7 categories.

## Categories Implemented

### 1. Customer Data (6 tags)
- `{{customer.first_name}}` - Customer's first name
- `{{customer.last_name}}` - Customer's last name  
- `{{customer.email}}` - Customer's email address
- `{{customer.phone}}` - Customer's phone number
- `{{customer.total_orders}}` - Total number of orders
- `{{customer.lifetime_value}}` - Customer's lifetime purchase value

### 2. Order Information (7 tags)
- `{{order.number}}` - Order number/ID
- `{{order.total}}` - Order total amount
- `{{order.status}}` - Current order status
- `{{order.tracking_number}}` - Shipping tracking number
- `{{order.items}}` - List of order items
- `{{order.shipping_address}}` - Shipping address
- `{{order.estimated_delivery}}` - Estimated delivery date

### 3. Product Data (7 tags)
- `{{product.name}}` - Product name
- `{{product.price}}` - Product price
- `{{product.image}}` - Product image URL
- `{{product.description}}` - Product description
- `{{product.url}}` - Product page URL
- `{{product.sku}}` - Product SKU
- `{{product.in_stock}}` - Stock availability status

### 4. Store Information (7 tags)
- `{{store.name}}` - Store/Business name
- `{{store.email}}` - Store contact email
- `{{store.phone}}` - Store phone number
- `{{store.address}}` - Store physical address
- `{{store.logo}}` - Store logo URL
- `{{store.website}}` - Store website URL
- `{{store.support_email}}` - Customer support email

### 5. Dynamic Content (11 tags)
- `{{abandoned_cart.items}}` - Abandoned cart items
- `{{abandoned_cart.total}}` - Abandoned cart total
- `{{abandoned_cart.link}}` - Cart recovery link
- `{{recommended_products}}` - Personalized product recommendations
- `{{discount_code}}` - Discount/coupon code
- `{{discount_amount}}` - Discount percentage or amount
- `{{discount_expiry}}` - Discount expiration date
- `{{loyalty_points}}` - Customer's loyalty points
- `{{loyalty_tier}}` - Customer's loyalty tier/status
- `{{referral_code}}` - Customer's referral code
- `{{wishlist_items}}` - Customer's wishlist items

### 6. Date & Time (4 tags)
- `{{date.current_year}}` - Current year
- `{{date.current_month}}` - Current month
- `{{date.current_day}}` - Current day
- `{{date.timestamp}}` - Full timestamp

### 7. Social Media & Links (6 tags)
- `{{unsubscribe_link}}` - Email unsubscribe link
- `{{preferences_link}}` - Email preferences link
- `{{social.facebook}}` - Facebook page URL
- `{{social.twitter}}` - Twitter/X profile URL
- `{{social.instagram}}` - Instagram profile URL
- `{{social.linkedin}}` - LinkedIn company URL

## Technical Implementation

### Files Created/Modified

1. **`/src/lib/merge-tags.ts`**
   - Central configuration for all merge tags
   - Helper functions for getting tags and sample data
   - Organized by category with proper TypeScript types

2. **`/src/components/editor/merge-tags-panel.tsx`**
   - Interactive UI component for browsing and copying merge tags
   - Search functionality
   - Collapsible categories
   - Copy-to-clipboard functionality
   - Sample data preview

3. **`/src/components/editor/unlayer-wrapper-fixed.tsx`**
   - Updated to use comprehensive merge tags
   - Integrated with Unlayer editor's merge tag system

## Features

### User Experience
- **Organized Categories**: Tags grouped logically for easy discovery
- **Search Functionality**: Quick search across all tags
- **Copy to Clipboard**: One-click copying of merge tags
- **Sample Data**: Preview of how tags will appear with real data
- **Visual Icons**: Category icons for better navigation

### Developer Experience
- **Type Safety**: Full TypeScript support
- **Extensible**: Easy to add new tags or categories
- **Centralized**: Single source of truth for all merge tags
- **Helper Functions**: Utilities for working with tags

## Usage in Templates

### Example: Welcome Email
```html
<p>Hi {{customer.first_name}},</p>
<p>Welcome to {{store.name}}! As a new member, you've earned {{loyalty_points}} to start shopping.</p>
```

### Example: Order Confirmation
```html
<h2>Order {{order.number}} Confirmed!</h2>
<p>Thank you {{customer.first_name}}, your order total of {{order.total}} has been processed.</p>
<p>Track your package: {{order.tracking_number}}</p>
```

### Example: Abandoned Cart
```html
<p>Hi {{customer.first_name}}, you left {{abandoned_cart.items}} in your cart!</p>
<p>Complete your purchase of {{abandoned_cart.total}} with code {{discount_code}} for {{discount_amount}} off.</p>
<a href="{{abandoned_cart.link}}">Return to Cart</a>
```

## Benefits

1. **Personalization**: Create highly personalized emails
2. **Engagement**: Increase open rates with dynamic subject lines
3. **Conversion**: Improve click-through with relevant content
4. **Automation**: Enable sophisticated email workflows
5. **Consistency**: Standardized tags across all templates

## Integration

The merge tags are automatically available in:
- Email editor (Unlayer)
- Template preview system
- Export functionality
- All saved templates

Simply type or paste any merge tag into your email content, and it will be replaced with actual data when emails are sent.