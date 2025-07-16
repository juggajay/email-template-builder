# Resend Documentation Overview

## Table of Contents
1. [API Integration](#api-integration)
2. [HTML Email Sending](#html-email-sending)
3. [Email Validation](#email-validation)
4. [Deliverability Best Practices](#deliverability-best-practices)
5. [React Email Integration](#react-email-integration)
6. [Webhook Events](#webhook-events)
7. [Code Examples](#code-examples)

## API Integration

### Base Configuration
- **Base URL**: `https://api.resend.com`
- **Protocol**: HTTPS only
- **Architecture**: REST-based API

### Authentication
All API requests require authentication using an API key in the Authorization header:
```
Authorization: Bearer re_xxxxxxxxx
```

### Rate Limits
- **Default**: 2 requests per second
- **Rate limit exceeded**: Returns `429` error
- **Increase**: Available for trusted senders upon request

### Response Codes
- `200`: Successful request
- `400`: Incorrect parameters
- `401`: Missing API key
- `403`: Invalid API key
- `404`: Resource not found
- `429`: Rate limit exceeded
- `5xx`: Resend server errors

### Key Endpoints
- `/emails` - Send and manage emails
- `/domains` - Domain management
- `/api-keys` - API key management
- `/broadcasts` - Broadcast emails
- `/audiences` - Audience management
- `/contacts` - Contact management

### Current Limitations
- No pagination support
- No API versioning (planned for future)

## HTML Email Sending

### Send Email Endpoint
- **Method**: POST
- **Route**: `/emails`

### Required Parameters
1. `from`: Sender email address (supports "Name <email@domain.com>" format)
2. `to`: Recipient email address(es) - max 50 recipients
3. `subject`: Email subject line
4. Email content (choose one):
   - `html`: HTML email body
   - `text`: Plain text email body
   - `react`: React component (Node.js SDK only)

### Optional Parameters
- `bcc`: Blind carbon copy recipients
- `cc`: Carbon copy recipients
- `reply_to`: Reply-to email address
- `scheduled_at`: Schedule email send time
- `headers`: Custom email headers
- `attachments`: File attachments (max 40MB)
- `tags`: Custom metadata tags for organization

### Node.js Example
```javascript
import { Resend } from 'resend';

const resend = new Resend('re_xxxxxxxxx');

const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['delivered@resend.dev'],
  subject: 'Welcome to Acme!',
  html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
  headers: {
    'X-Custom-Header': 'value'
  },
  tags: [
    {
      name: 'category',
      value: 'onboarding'
    }
  ]
});

// Successful response
// { id: "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794" }
```

### Python Example
```python
import os
import resend

resend.api_key = os.environ["RESEND_API_KEY"]

params: resend.Emails.SendParams = {
    "from": "Acme <onboarding@resend.dev>",
    "to": ["delivered@resend.dev"],
    "subject": "Welcome to Acme!",
    "html": "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
    "headers": {
        "X-Custom-Header": "value"
    },
    "tags": [
        {
            "name": "category",
            "value": "onboarding"
        }
    ]
}

email = resend.Emails.send(params)
print(email)
```

## Email Validation

While specific email validation endpoints weren't found in the scraped documentation, Resend appears to handle basic email validation through:

1. **API Parameter Validation**: The API returns `400` errors for incorrect parameters
2. **Domain Verification**: Requires domain ownership verification before sending
3. **Recipient Limits**: Maximum 50 recipients per email

For advanced email validation, you may need to:
- Implement client-side validation before sending
- Use the API error responses to handle invalid emails
- Monitor bounce rates through webhooks

## Deliverability Best Practices

### Domain Configuration
1. **Use Subdomains**: Recommended to isolate sending reputation
   - Example: `updates.yourdomain.com` instead of `yourdomain.com`
   - Protects your main domain's reputation

2. **DNS Records Required**:
   - **SPF (Sender Policy Framework)**: TXT record listing authorized IP addresses
   - **DKIM (DomainKeys Identified Mail)**: TXT record with public key for email authentication
   - **DMARC (optional)**: Additional trust layer with mailbox providers

### Domain Verification Process
Domain goes through these status stages:
1. `not_started` - Initial state
2. `pending` - DNS records added, awaiting verification
3. `verified` - Successfully verified and ready to send
4. `failed` - Verification failed
5. `temporary_failure` - Temporary issue, will retry

### Tracking Considerations
- **Open tracking**: Disabled by default, uses 1x1 transparent pixel
- **Click tracking**: Disabled by default, modifies links to route through Resend
- Consider privacy implications when enabling tracking

### Best Practices Summary
1. Always use subdomains for transactional emails
2. Properly configure SPF and DKIM records
3. Monitor domain status regularly
4. Consider DMARC for additional security
5. Be mindful of tracking features and user privacy

## React Email Integration

While specific React Email documentation wasn't fully available in the scraped content, Resend supports React Email through the Node.js SDK:

### Basic React Email Usage
```javascript
import { Resend } from 'resend';
import { EmailTemplate } from './email-template';

const resend = new Resend('re_xxxxxxxxx');

await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  subject: 'Welcome!',
  react: EmailTemplate({ firstName: 'John' })
});
```

### Creating Email Templates with React
```jsx
// email-template.jsx
export const EmailTemplate = ({ firstName }) => (
  <div>
    <h1>Welcome, {firstName}!</h1>
    <p>Thanks for signing up. We're excited to have you on board.</p>
    <button href="https://example.com/dashboard">
      Get Started
    </button>
  </div>
);
```

### Benefits of React Email
1. Component-based email templates
2. Type safety with TypeScript
3. Reusable components
4. Better developer experience
5. Automatic HTML/CSS compatibility

## Webhook Events

### Overview
Webhooks provide real-time notifications about email events:
- **Protocol**: HTTPS with JSON payloads
- **Response**: Must return `HTTP 200 OK` for successful receipt

### Use Cases
1. Automatically manage mailing lists (unsubscribes)
2. Create event-based alerts
3. Store send events for custom reporting
4. Track email engagement

### Implementation Steps
1. Create a local endpoint to receive POST requests
2. Register development webhook endpoint
3. Test endpoint functionality
4. Deploy to production
5. Register production webhook endpoint

### Example Webhook Handler (Next.js)
```typescript
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const payload = req.body;
    
    // Process the webhook event
    switch(payload.type) {
      case 'email.sent':
        console.log('Email sent:', payload.data);
        break;
      case 'email.delivered':
        console.log('Email delivered:', payload.data);
        break;
      case 'email.bounced':
        console.log('Email bounced:', payload.data);
        // Handle bounce
        break;
      case 'email.complained':
        console.log('Spam complaint:', payload.data);
        // Handle complaint
        break;
    }
    
    // Always respond with 200 OK
    res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
  }
}
```

### Webhook Security Best Practices
1. Verify webhook signatures (if provided)
2. Use HTTPS endpoints only
3. Implement idempotency
4. Process webhooks asynchronously
5. Handle retries gracefully

## Code Examples

### Complete Test Email Example (Node.js)
```javascript
import { Resend } from 'resend';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Test <test@yourdomain.com>',
      to: ['test@example.com'],
      subject: 'Test Email from Builder',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Test Email</h1>
          <p>This is a test email sent from our email builder.</p>
          <p>Current time: ${new Date().toLocaleString()}</p>
          <div style="background-color: #f0f0f0; padding: 20px; margin: 20px 0;">
            <h2>Features Tested:</h2>
            <ul>
              <li>HTML formatting</li>
              <li>Inline styles</li>
              <li>Dynamic content</li>
            </ul>
          </div>
          <a href="https://example.com" style="
            display: inline-block; 
            padding: 10px 20px; 
            background-color: #007bff; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
          ">Click Me</a>
        </div>
      `,
      tags: [
        {
          name: 'environment',
          value: 'test'
        }
      ]
    });

    if (error) {
      console.error('Error sending email:', error);
      return;
    }

    console.log('Email sent successfully:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the test
sendTestEmail();
```

### Batch Email Sending Example
```javascript
async function sendBatchEmails(recipients) {
  const emailPromises = recipients.map(recipient => 
    resend.emails.send({
      from: 'Newsletter <newsletter@yourdomain.com>',
      to: [recipient.email],
      subject: 'Your Weekly Update',
      html: generateEmailHtml(recipient),
      tags: [
        {
          name: 'campaign',
          value: 'weekly-newsletter'
        }
      ]
    })
  );

  try {
    const results = await Promise.allSettled(emailPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Email sent to ${recipients[index].email}: ${result.value.data.id}`);
      } else {
        console.error(`Failed to send to ${recipients[index].email}:`, result.reason);
      }
    });
  } catch (err) {
    console.error('Batch send error:', err);
  }
}
```

### Email with Attachments Example
```javascript
import fs from 'fs';

async function sendEmailWithAttachment() {
  const pdfBuffer = fs.readFileSync('./report.pdf');
  
  const { data, error } = await resend.emails.send({
    from: 'Reports <reports@yourdomain.com>',
    to: ['user@example.com'],
    subject: 'Your Monthly Report',
    html: '<p>Please find your monthly report attached.</p>',
    attachments: [
      {
        filename: 'monthly-report.pdf',
        content: pdfBuffer.toString('base64'),
        type: 'application/pdf',
        disposition: 'attachment'
      }
    ]
  });
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Email sent:', data);
  }
}
```

## SDK Support

Resend provides official SDKs for:
- Node.js / JavaScript
- Python
- PHP
- Ruby
- Go
- Rust
- Elixir
- Java
- .NET
- And more...

## Getting Started Checklist

1. [ ] Sign up for Resend account
2. [ ] Create API key
3. [ ] Add and verify your domain
4. [ ] Configure DNS records (SPF, DKIM)
5. [ ] Install SDK for your language
6. [ ] Send test email
7. [ ] Set up webhook endpoint (optional)
8. [ ] Implement error handling
9. [ ] Monitor deliverability metrics
10. [ ] Deploy to production

## Additional Resources

- [Official Documentation](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference)
- [Node.js Example Repository](https://github.com/resend/resend-node-example)
- [Python Example Repository](https://github.com/resend/resend-python-example)
- [Webhook Examples](https://github.com/resend/resend-examples/tree/main/with-webhooks)