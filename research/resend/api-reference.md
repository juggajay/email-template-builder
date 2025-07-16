# Resend API Reference

## Base Configuration
- **Base URL**: `https://api.resend.com`
- **Protocol**: HTTPS only  
- **Architecture**: REST-based API

## Authentication
Use API key in Authorization header:
```
Authorization: Bearer re_xxxxxxxxx
```

## Rate Limits
- **Default**: 2 requests per second
- **Rate limit exceeded**: Returns `429` error
- **Increase**: Available for trusted senders upon request

## Response Codes
- `200`: Successful request
- `400`: Incorrect parameters
- `401`: Missing API key
- `403`: Invalid API key
- `404`: Resource not found
- `429`: Rate limit exceeded
- `5xx`: Resend server errors

## Current Limitations
- No pagination support
- No API versioning (planned for future)

## Key Endpoints
- `/emails` - Send and manage emails
- `/domains` - Domain management
- `/api-keys` - API key management
- `/broadcasts` - Broadcast emails
- `/audiences` - Audience management
- `/contacts` - Contact management