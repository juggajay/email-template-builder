# ZebaMail Help Documentation

## Welcome to ZebaMail 🦓

ZebaMail is a powerful email template builder designed specifically for e-commerce businesses. Our platform combines sophisticated automation with an intuitive interface to help you create revenue-driving email campaigns that scale with your business.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Email Editor - Core Features](#email-editor---core-features)
4. [Advanced Merge Tags System](#advanced-merge-tags-system)
5. [Template Library](#template-library)
6. [Integrations](#integrations)
7. [Account Management](#account-management)
8. [Billing & Subscriptions](#billing--subscriptions)
9. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Quick Start Guide

1. **Sign Up**: Create your account at [zebamail.com/signup](https://zebamail.com/signup)
2. **Choose Your Plan**: Start with our Free plan (5 exports/month) or upgrade to Pro/Agency
3. **Connect Your Store**: Link your Shopify store for dynamic product and customer data
4. **Pick a Template**: Browse our library of 20+ proven e-commerce templates
5. **Customize & Export**: Use our visual editor to personalize and export to your email platform

### Account Types

- **Free**: 5 exports/month, access to all templates, basic features
- **Pro ($29/month)**: Unlimited exports, priority support, advanced analytics
- **Agency ($49/month)**: White-label exports, team collaboration, API access

---

## Dashboard Overview

Your dashboard is your command center for email marketing success:

### Key Metrics
- **Monthly Revenue Generated**: Track revenue from your email campaigns
- **Campaign Performance**: View open rates, click-through rates, and conversions
- **Template Usage**: See which templates drive the most revenue
- **Export Tracking**: Monitor your monthly export usage

### Quick Actions
- **Build Campaign**: One-click access to the email editor
- **Browse Templates**: Explore our template library
- **View Analytics**: Deep dive into campaign performance
- **Manage Integrations**: Connect email platforms and stores

---

## Email Editor - Core Features

Our visual email editor is built on the powerful Unlayer platform with custom e-commerce enhancements:

### 🎨 **Drag-and-Drop Interface**
- **Intuitive Building**: Simply drag elements from the sidebar into your email
- **Pre-built Rows**: Choose from 15+ responsive row layouts
- **Content Blocks**: Text, images, buttons, dividers, spacers, and more
- **E-commerce Blocks**: Product showcases, abandoned cart items, order summaries

### 📱 **Responsive Design**
- **Mobile-First**: All templates automatically adapt to any screen size
- **Device Preview**: Test your email on desktop, tablet, and mobile views
- **Custom Breakpoints**: Fine-tune mobile styles for perfect rendering

### 🎯 **Smart Product Integration**
- **Shopify Connection**: Pull products directly from your store
- **Dynamic Pricing**: Automatically update prices and availability
- **Product Grids**: Create beautiful product showcases with 1-4 column layouts
- **Abandoned Cart Recovery**: Auto-populate cart items with personalized data

### 🖌️ **Advanced Styling Options**
- **Global Styles**: Set consistent fonts, colors, and spacing
- **Custom CSS**: Add custom styles for advanced customization
- **Background Images**: Full-width backgrounds with overlay options
- **Border & Shadow**: Professional design effects with visual controls

### 💾 **Save & Export Options**
- **Auto-Save**: Never lose your work with automatic saving
- **Template Library**: Save your designs as reusable templates
- **Multiple Export Formats**:
  - **HTML**: Download optimized HTML for any platform
  - **Klaviyo**: Direct integration with merge tags mapped
  - **Mailchimp**: One-click export with proper formatting
  - **Shopify Email**: Native Shopify formatting
  - **Omnisend**: Seamless integration with dynamic content

---

## Advanced Merge Tags System

Our enterprise-grade merge tags system enables sophisticated personalization:

### 🏷️ **48+ Pre-built Merge Tags**

#### Customer Information
- `{{customer.first_name}}` - Customer's first name
- `{{customer.last_name}}` - Customer's last name
- `{{customer.email}}` - Email address
- `{{customer.lifetime_value}}` - Total spend history
- `{{customer.total_orders}}` - Number of orders placed
- `{{customer.loyalty_points}}` - Current loyalty points

#### Order Details
- `{{order.number}}` - Order number
- `{{order.total}}` - Order total with currency
- `{{order.tracking_number}}` - Shipment tracking
- `{{order.estimated_delivery}}` - Delivery date
- `{{order.items}}` - List of ordered items

#### Product Information
- `{{product.name}}` - Product title
- `{{product.price}}` - Current price
- `{{product.compare_at_price}}` - Original price
- `{{product.image}}` - Product image URL
- `{{product.description}}` - Product description
- `{{product.in_stock}}` - Stock status

### 🧮 **Conditional Logic Engine**

Create dynamic content based on customer data:

```handlebars
{{#if customer.total_orders > 5}}
  Welcome back, VIP customer! Enjoy 20% off.
{{else}}
  Welcome! Here's 10% off your first order.
{{/if}}

{{#if product.in_stock}}
  <button>Buy Now</button>
{{else}}
  <button>Join Waitlist</button>
{{/if}}
```

**Supported Operators**:
- Comparison: `>`, `<`, `>=`, `<=`, `==`, `!=`
- String matching: `contains`, `starts_with`, `ends_with`
- Existence: `exists`, `is_empty`, `is_not_empty`
- Type checking: `is_number`, `is_string`

### 🔄 **Fallback Values**

Ensure emails always look perfect with fallback values:

```handlebars
{{customer.first_name|"Valued Customer"}}
{{order.tracking_number|"Processing your order"}}
{{product.price|"Contact for pricing"}}
```

### 🧪 **Real-Time Testing**

- **Test Profiles**: Create multiple customer profiles for testing
- **Live Preview**: See merge tags replaced in real-time
- **Import Test Data**: Upload CSV files with customer data
- **Conditional Testing**: Verify logic with different scenarios

### 🚀 **Shopify-Specific Features**

When connected to Shopify, unlock 50+ additional merge tags:
- Customer tags and segments
- Detailed product variants
- Inventory levels
- Discount codes
- Collection information
- Multi-currency support
- Metafield access

---

## Template Library

### 📚 **20+ Professional Templates**

Our templates are designed by e-commerce experts and proven to drive revenue:

#### Categories
- **Abandoned Cart** (3 templates): Recover lost sales with urgency
- **Welcome Series** (4 templates): Build relationships from day one
- **Product Launch** (3 templates): Generate buzz for new products
- **Order Confirmation** (2 templates): Enhance post-purchase experience
- **Win-back Campaigns** (3 templates): Re-engage dormant customers
- **Promotional** (5 templates): Drive sales with special offers

### 📊 **Performance Metrics**

Each template shows:
- **Monthly Revenue**: Average revenue generated
- **Conversion Rate**: Typical conversion performance
- **Usage Count**: Popularity among users
- **Star Rating**: Community feedback

### 🎯 **Smart Recommendations**

- **Industry-Specific**: Templates tailored to your business type
- **Growth Stage**: Recommendations based on your business size
- **Performance-Based**: Top performers highlighted
- **Seasonal**: Holiday and event-specific templates

---

## Integrations

### 🛍️ **Shopify Integration**

Deep, native integration with your Shopify store:
- **One-Click Connection**: OAuth-based secure connection
- **Real-Time Data Sync**: Products, customers, orders updated automatically
- **Abandoned Cart Recovery**: Automatic cart data population
- **Customer Segments**: Target based on purchase history
- **Product Recommendations**: AI-powered product suggestions

### 📧 **Email Platform Exports**

Seamless integration with major email platforms:

#### Klaviyo
- Automatic merge tag mapping
- Segment integration
- Flow compatibility
- Custom properties support

#### Mailchimp
- List synchronization
- Tag preservation
- Campaign tracking
- Automation support

#### Omnisend
- Workflow integration
- Product picker support
- Dynamic discount codes
- SMS compatibility

#### Others Supported
- Constant Contact
- SendGrid
- Shopify Email
- HubSpot
- ActiveCampaign

---

## Account Management

### 👤 **Profile Settings**
- **Company Information**: Name, logo, contact details
- **Brand Colors**: Set default colors for templates
- **Email Preferences**: Notification settings
- **API Keys**: Manage integration credentials

### 👥 **Team Management** (Agency Plan)
- **Invite Team Members**: Collaborate on templates
- **Permission Controls**: Set access levels
- **Client Workspaces**: Organize by client
- **Activity Logs**: Track team actions

### 🔒 **Security Features**
- **Two-Factor Authentication**: Enhanced account security
- **API Token Management**: Secure API access
- **Session Management**: Control active sessions
- **Data Export**: Download all your data

---

## Billing & Subscriptions

### 💳 **Subscription Management**
- **Flexible Plans**: Upgrade, downgrade, or cancel anytime
- **Usage Tracking**: Real-time export monitoring
- **Billing History**: Download invoices and receipts
- **Payment Methods**: Credit card, debit card support

### 📊 **Usage Monitoring**
- **Export Counter**: Track monthly exports
- **Overage Handling**: Automatic notifications before limits
- **Usage Reports**: Detailed breakdown by template
- **Team Usage**: Track individual team member activity

---

## Tips & Best Practices

### 🎯 **Email Design Best Practices**

1. **Mobile-First Design**
   - Keep subject lines under 50 characters
   - Use single-column layouts for mobile
   - Make CTAs at least 44px tall
   - Test on real devices

2. **Personalization Strategy**
   - Use first name in subject lines (increases open rates by 26%)
   - Segment based on purchase history
   - Include dynamic product recommendations
   - Test different merge tag combinations

3. **Conversion Optimization**
   - Place primary CTA above the fold
   - Use urgency in abandoned cart emails
   - Include social proof (reviews, testimonials)
   - A/B test button colors and copy

### 📈 **Advanced Techniques**

1. **Conditional Content**
   ```handlebars
   {{#if customer.tags contains "VIP"}}
     {{#if order.total > 100}}
       You've earned free shipping and a bonus gift!
     {{/if}}
   {{/if}}
   ```

2. **Dynamic Pricing**
   ```handlebars
   {{#if customer.total_orders == 0}}
     Special first-time buyer price: {{product.price * 0.9}}
   {{else}}
     Loyal customer price: {{product.price * 0.95}}
   {{/if}}
   ```

3. **Smart Recommendations**
   - Use purchase history for personalized suggestions
   - Show complementary products in order confirmations
   - Include recently viewed items in win-back emails

### 🚀 **Performance Tips**

1. **Image Optimization**
   - Keep images under 200KB
   - Use JPG for photos, PNG for graphics
   - Include alt text for accessibility
   - Host images on CDN for speed

2. **Code Quality**
   - Validate HTML before sending
   - Test in multiple email clients
   - Keep CSS inline for compatibility
   - Minimize custom code usage

---

## Need More Help?

### 📞 **Support Channels**
- **Email**: support@zebamail.com
- **Live Chat**: Available for Pro/Agency users
- **Documentation**: docs.zebamail.com
- **Video Tutorials**: youtube.com/zebamail

### 🐛 **Report Issues**
- Visit: github.com/zebamail/feedback
- Include: Browser, template name, error details
- Screenshots help us resolve issues faster

### 💡 **Feature Requests**
We love hearing from our users! Submit ideas at feedback.zebamail.com

---

*Last updated: 2024*