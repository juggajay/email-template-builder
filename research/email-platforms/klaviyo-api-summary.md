# Klaviyo API Integration Summary

## Overview
Klaviyo provides a comprehensive REST API for email marketing automation with strong template management capabilities.

## Authentication Methods
1. **Private Key Authentication** (Primary)
   - Used for `/api` endpoints
   - Header: `Authorization: Klaviyo-API-Key your-private-api-key`
   - Required for most operations

2. **OAuth** 
   - Recommended for tech partners
   - Provides improved security and higher rate limits
   - Better for multi-account integrations

3. **Public Key Authentication**
   - Used for `/client` endpoints
   - Requires company ID as public API key
   - Limited to object creation only

## Template Management APIs

### List Templates
- **Endpoint**: `GET https://a.klaviyo.com/api/templates`
- **Scope Required**: `templates:read`
- **Features**:
  - Pagination (max 10 results per page)
  - Filtering and sorting support
  - Sort fields: `id`, `name`, `created`, `updated`

### Create Template
- **Endpoint**: `POST https://a.klaviyo.com/api/templates`
- **Scope Required**: `templates:write`
- **Limitations**: 
  - Maximum 1,000 templates via API
  - Creation fails if limit reached
  - Requires custom HTML template

### Other Template Operations
- **Get Template**: `GET /api/templates/{id}`
- **Update Template**: `PATCH /api/templates/{id}`
- **Delete Template**: `DELETE /api/templates/{id}`
- **Render Template**: `POST /api/templates/{id}/render`
- **Clone Template**: `POST /api/templates/{id}/clone`

## Rate Limits
Klaviyo uses fixed-window rate limiting with two windows:

### Standard Rate Limit Tiers
- **XS**: 1/s burst; 15/m steady
- **S**: 3/s burst; 60/m steady
- **M**: 10/s burst; 150/m steady (Default)
- **L**: 75/s burst; 700/m steady
- **XL**: 350/s burst; 3500/m steady

### Rate Limit Handling
- Returns `HTTP 429` when exceeded
- Headers indicate remaining requests
- Recommends exponential backoff with randomness

## HTML Email Requirements
- Custom HTML templates supported
- Must follow email best practices
- Uses JSON:API standards for data format
- Supports template variables and personalization

## Integration Best Practices
1. **Error Handling**
   - Monitor HTTP status codes (2xx success, 4xx client errors, 5xx server errors)
   - Detailed error responses include ID, code, title, and description
   - Implement retry logic for 429 and 503 errors

2. **Performance Optimization**
   - Use sparse fieldsets to reduce payload size
   - Implement cursor-based pagination for large datasets
   - Cache templates when possible

3. **Data Format**
   - All datetime values must use ISO 8601 RFC 3339 format
   - Supports relationships and includes
   - JSON:API compliant request/response format

4. **Development Tools**
   - SDKs available for easier integration
   - Postman collections for testing
   - Comprehensive API reference documentation

## Key Considerations
- API versioning with deprecation policies
- Maximum of 1,000 templates per account via API
- Strong filtering and sorting capabilities
- Support for template rendering and cloning
- Robust error reporting and debugging information