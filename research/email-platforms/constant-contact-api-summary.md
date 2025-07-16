# Constant Contact V3 API Integration Summary

## Overview
Constant Contact provides a RESTful V3 API with comprehensive email marketing capabilities, featuring 99.99% uptime and mobile-friendly payloads.

## Authentication Methods

### OAuth2 Flows
1. **Authorization Code Flow**
   - For traditional web applications
   - Most secure for server-side apps
   - Requires client secret

2. **PKCE Flow** (Recommended)
   - For public client applications
   - Enhanced security without client secret
   - Best for SPAs and mobile apps

3. **Device Flow**
   - For input-constrained devices
   - TV apps, IoT devices

4. **Implicit Flow**
   - For single-page/mobile apps
   - Without web crypto support
   - Less secure, being phased out

### Authentication Details
- **Authorization Endpoint**: `https://authz.constantcontact.com/oauth2/default/v1/authorize`
- **Token Endpoint**: `https://authz.constantcontact.com/oauth2/default/v1/token`
- **Access Token Lifetime**: 24 hours
- **Refresh Token Lifetime**: 180 days
- **Header Format**: `Authorization: Bearer {access_token}`

### Required Scopes
- `campaign_data`: For email campaign operations
- `contact_data`: For contact management
- `account_read`: For account information

## Email Campaign Creation API

### Create Email Campaign
- **Endpoint**: `POST /emails`
- **Required Privileges**: 
  - User: `campaign:write`
  - Scope: `campaign_data`

### Required Request Body
```json
{
  "name": "Unique Campaign Name",
  "email_campaign_activities": [{
    "format_type": 5,  // 5 = custom HTML
    "from_email": "verified@email.com",
    "reply_to_email": "verified@email.com",
    "from_name": "Sender Name",
    "subject": "Email Subject",
    "html_content": "<html>...[[trackingImage]]...</html>"
  }]
}
```

### Optional Fields
- `preheader`: Preview text after subject
- `physical_address_in_footer`: Custom footer address
- `document_properties`: Additional metadata

## HTML Email Requirements
1. **Tracking Requirements**
   - Must include `[[trackingImage]]` tag
   - Enables open tracking
   - Required for analytics

2. **HTML Standards**
   - Valid HTML markup
   - Supports inline CSS
   - Allows `<style>` tag declarations
   - UTF-8 encoding

3. **Personalization Tags**
   - Dynamic content support
   - Merge fields for customization
   - Conditional content blocks

4. **Format Types**
   - Type 5: Custom HTML code
   - Type 3: Template-based
   - Type 11: A/B test campaigns

## Rate Limits
- **Tech Partner Program**: Higher limits available
- Standard limits vary by plan
- Returns 429 when exceeded
- Implements per-minute quotas

## Integration Best Practices
1. **Security**
   - Never expose client secrets
   - Use appropriate OAuth flow
   - Request minimal scopes
   - Implement token refresh

2. **Campaign Workflow**
   - Create campaign first
   - Add recipients separately
   - Schedule or send immediately
   - Monitor delivery status

3. **Error Handling**
   - Check HTTP status codes
   - Parse error responses
   - Implement retry logic
   - Log failed requests

4. **Performance**
   - Batch contact operations
   - Use pagination for lists
   - Cache authentication tokens
   - Minimize API calls

## Key Features
- **Contact Management**: Comprehensive list and segment management
- **Email Templates**: Reusable templates and blocks
- **Reporting**: Detailed analytics and metrics
- **Automation**: Triggered email series
- **A/B Testing**: Built-in split testing
- **Landing Pages**: Integrated page builder
- **Event Management**: Registration and RSVP tracking

## Important Limitations
- Confirmed email addresses required for sending
- Physical address required in footer
- Campaign names must be unique
- HTML content size limits apply

## Additional Capabilities
- SMS marketing integration
- Social media posting
- Survey tools
- Event registration
- E-commerce integrations

## Support Resources
- Quick Start Guide available
- API Reference documentation
- 24/7 customer support
- Developer portal access
- Postman collections

## Implementation Notes
1. Register application in Developer Portal
2. Implement OAuth2 flow
3. Verify sender email addresses
4. Test with sandbox account
5. Monitor rate limits and quotas