# Shopify App Authentication and Authorization

## Overview
Authentication and authorization are fundamental to Shopify app security and functionality.

### Key Concepts

**Authentication vs. Authorization**
- **Authentication**: Verifying the identity of the user or the app
- **Authorization**: The process of giving permissions to apps

### Authentication Methods

1. **Embedded Apps**: Use session tokens
2. **Non-embedded Apps**: Must implement custom authentication

### Authorization Flows

Shopify uses OAuth 2.0 as the standard protocol with multiple implementation methods:

1. **Shopify-managed installation** (recommended)
2. **Authorization code grant**
3. **Token exchange**

### Access Token Types

1. **Online access tokens**
   - Tied to individual user sessions
   - Expire when the user logs out
   - Best for user-specific actions

2. **Offline access tokens**
   - Long-lived tokens
   - Not tied to user sessions
   - Ideal for background jobs and webhooks

3. **Delegate access tokens**
   - For specific delegated permissions
   - Limited scope access

### App Installation Process

1. Configure access scopes using Shopify CLI
2. Shopify manages installation to reduce redirects
3. Merchants authorize app during installation
4. App receives access tokens for API access

### Security Best Practices

- All API requests must authenticate
- Use session tokens for embedded apps
- Implement secure token management
- Protect against common vulnerabilities
- Store tokens securely
- Validate webhook requests

### Recommended Tools

- **Shopify CLI**: For app scaffolding and configuration
- **Official API libraries**: Available for Ruby, Node.js, and other languages
- **Token exchange mechanism**: For secure token management

## Implementation Notes

The authentication system is designed to create secure, efficient processes that minimize user friction while maintaining robust security standards. Shopify-managed installation is the recommended approach as it handles most of the complexity automatically.