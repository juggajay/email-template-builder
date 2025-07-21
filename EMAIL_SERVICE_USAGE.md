# Email Service Integration Guide

This guide shows how to use the integrated Resend/SendGrid email service with your email template builder.

## 🚀 Quick Setup

### 1. Environment Variables

Add these to your `.env.local`:

```bash
# Email Provider Configuration
DEFAULT_EMAIL_PROVIDER=resend
FALLBACK_EMAIL_PROVIDER=sendgrid

# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_WEBHOOK_SECRET=your_webhook_secret

# SendGrid Configuration  
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_WEBHOOK_SECRET=your_webhook_public_key

# Default From Address
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
DEFAULT_FROM_NAME=Your App Name

# App URL for tracking
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 2. Database Setup

Run the SQL schema in `email-service-schema.sql` in your Supabase database.

### 3. Install Dependencies

```bash
npm install @radix-ui/react-dialog @radix-ui/react-switch
```

## 🎯 Core Features

### Send Test Email

```typescript
import { SendTestEmail } from '@/components/email/send-test-email';

// In your editor component
<SendTestEmail 
  templateHtml={templateHtml}
  templateSubject="Preview: Welcome Email"
  onEmailSent={(result) => {
    console.log('Test email sent:', result);
  }}
/>
```

### Send Single Email

```typescript
import { getEmailService } from '@/lib/email/email-service';

const emailService = getEmailService();

const result = await emailService.sendEmail({
  from: { 
    email: 'hello@yourdomain.com', 
    name: 'Your App' 
  },
  to: [{ 
    email: 'user@example.com', 
    name: 'John Doe' 
  }],
  content: {
    subject: 'Welcome to our service!',
    html: templateHtml
  },
  templateData: {
    customer: {
      first_name: 'John',
      email: 'john@example.com'
    }
  },
  trackOpens: true,
  trackClicks: true
});
```

### Batch Send Emails

```typescript
const emails = users.map(user => ({
  from: { email: 'hello@yourdomain.com', name: 'Your App' },
  to: [{ email: user.email, name: user.name }],
  content: {
    subject: 'Newsletter',
    html: templateHtml
  },
  templateData: {
    customer: {
      first_name: user.first_name,
      email: user.email
    }
  }
}));

const batchResult = await emailService.sendBatch({
  emails,
  batchSize: 100,
  delayBetweenBatches: 1000
});
```

### Domain Verification

```typescript
// Add domain for verification
const verification = await emailService.verifyDomain('yourdomain.com', 'resend');

// Check verification status
const status = await emailService.getDomainStatus('yourdomain.com', 'resend');
```

## 📊 Email Analytics

### View Analytics Dashboard

Add this to your navigation:

```typescript
import { EmailAnalyticsDashboard } from '@/components/email/email-analytics-dashboard';

// Route: /email-settings
<EmailAnalyticsDashboard />
```

### Get Email Analytics

```typescript
// Get analytics for a specific email
const analytics = await emailService.getEmailAnalytics(emailId);

console.log(`Open Rate: ${analytics.openRate}%`);
console.log(`Click Rate: ${analytics.clickRate}%`);
console.log(`Bounce Rate: ${analytics.bounceRate}%`);
```

## ⚙️ Configuration UI

### Email Service Settings

```typescript
import { EmailServiceConfig } from '@/components/email/email-service-config';

// Route: /email-settings
<EmailServiceConfig />
```

This provides:
- Provider connection testing
- Domain verification with DNS records
- Webhook endpoint configuration
- Email tracking settings

## 🔗 API Endpoints

### Send Email
```
POST /api/email/send
{
  "to": "user@example.com",
  "subject": "Welcome!",
  "html": "<h1>Hello World</h1>",
  "provider": "resend"
}
```

### Send Test Email
```
POST /api/email/test
{
  "to": "test@example.com", 
  "html": "<h1>Test</h1>",
  "templateData": { "name": "John" }
}
```

### Batch Send
```
POST /api/email/batch
{
  "emails": [
    {
      "to": "user1@example.com",
      "subject": "Newsletter",
      "html": "<h1>News</h1>"
    }
  ],
  "batchSize": 100
}
```

### Domain Management
```
GET /api/email/domains          # List domains
POST /api/email/domains         # Add domain
POST /api/email/domains/:domain/verify  # Verify domain
```

### Analytics
```
GET /api/email/sent                    # List sent emails
GET /api/email/analytics/:emailId     # Get email analytics
```

## 🎣 Webhook Handling

### Resend Webhooks
Configure in Resend dashboard:
- Endpoint: `https://yourdomain.com/api/email/webhooks/resend`
- Events: All email events

### SendGrid Webhooks  
Configure in SendGrid dashboard:
- Endpoint: `https://yourdomain.com/api/email/webhooks/sendgrid`
- Events: All email events

## 📈 Email Tracking

### Open Tracking
Automatically adds 1x1 pixel tracking:
```html
<img src="https://yourdomain.com/api/email/track/open/email_123" width="1" height="1" style="display:none;" />
```

### Click Tracking
Automatically wraps links:
```html
<a href="https://yourdomain.com/api/email/track/click/email_123?url=https://example.com">
  Original Link
</a>
```

## 💡 Best Practices

### 1. Domain Verification
- Always verify your sending domain
- Set up DKIM, SPF, and DMARC records
- Use subdomains for different email types

### 2. Template Data
- Use fallback values: `{{customer.name|"Valued Customer"}}`
- Test with various data scenarios
- Validate merge tags before sending

### 3. Sending Limits
- Respect provider rate limits
- Use batch sending for large lists
- Implement retry logic for failures

### 4. Analytics
- Track opens and clicks for engagement
- Monitor bounce and complaint rates
- Set up alerts for high bounce rates

### 5. Testing
- Always send test emails before campaigns
- Test on multiple email clients
- Verify tracking functionality

## 🛠️ Error Handling

```typescript
try {
  const result = await emailService.sendEmail(options);
  
  if (result.status === 'failed') {
    console.error('Email failed:', result.error);
    // Handle failure
  }
} catch (error) {
  console.error('Send error:', error);
  // Handle error
}
```

## 🔄 Provider Fallback

The service automatically falls back to secondary provider if primary fails:

```typescript
// Configuration
const config = {
  defaultProvider: 'resend',
  fallbackProvider: 'sendgrid',
  retryAttempts: 3
};
```

## 📝 Integration Checklist

- [ ] Add environment variables
- [ ] Run database schema
- [ ] Configure email providers (API keys)
- [ ] Verify domains
- [ ] Set up webhooks
- [ ] Test sending functionality
- [ ] Configure tracking
- [ ] Set up analytics dashboard
- [ ] Test fallback providers
- [ ] Monitor delivery rates

## 🚨 Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Check environment variables
   - Verify API key in provider dashboard
   - Test connection in settings

2. **Domain Not Verified**
   - Add DNS records as shown in settings
   - Wait for DNS propagation (up to 24 hours)
   - Re-verify domain

3. **High Bounce Rate**
   - Clean email list
   - Check domain reputation
   - Verify email content

4. **Webhooks Not Working**
   - Check webhook URLs
   - Verify webhook signatures
   - Check server logs

## 📚 Advanced Usage

### Custom Provider
Extend the `EmailProvider` class to add new email services:

```typescript
class CustomProvider extends EmailProvider {
  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    // Implement custom sending logic
  }
}
```

### Merge Tag Processing
Use the enhanced merge tag system:

```typescript
import { replaceMergeTags } from '@/lib/merge-tags/parser';

const personalizedContent = replaceMergeTags(
  templateHtml,
  userData,
  { useFallbacks: true }
);
```

This comprehensive email service integration provides enterprise-level email functionality with analytics, tracking, and multi-provider support!