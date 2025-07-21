# Version Control & Stable Release

## Current Stable Version: 0.1.2
**Date**: January 18, 2025
**Commit**: 4f10950

## What's Working in This Version

### ✅ Core Features
- User authentication (Supabase)
- Email template editor (Unlayer)
- Template saving and management
- Template categories
- User profiles and settings

### ✅ Security Features (NEW)
- Rate limiting on all API endpoints
- Input validation with Zod
- Security headers middleware
- Webhook signature validation
- Error handling (no info disclosure)
- Security event logging
- CSRF protection
- XSS prevention

### ✅ Shopify Integration
- OAuth flow for connecting stores
- Product sync and caching
- Customer segment sync
- Order history integration
- Abandoned cart retrieval
- Shopify blocks in email editor
- Merge tags for personalization

### ✅ Infrastructure
- Next.js 14 App Router
- TypeScript
- Supabase (Auth + Database)
- Vercel deployment ready
- Environment variable configuration

## Critical Files - DO NOT DELETE

### Security Implementation
- `/src/lib/security/` - All security utilities
- `/src/middleware.ts` - Security headers
- `/supabase/migrations/20240118_security_logs_table.sql` - Security logs DB

### Core Components
- `/src/components/editor/unlayer-wrapper-fixed.tsx` - Main editor component
- `/src/app/api/` - All API routes with security
- `/src/lib/supabase/` - Database configuration

### Configuration
- `/.env.production.example` - Production env template
- `/vercel.json` - Vercel deployment config
- `/.vercelignore` - Deployment exclusions

## Environment Variables Required

### Minimum for Basic Operation
```
NEXT_PUBLIC_SUPABASE_URL=https://uvcebvlmufytjxiysbhr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### For Email Sending
```
RESEND_API_KEY=re_xxxxx
DEFAULT_FROM_EMAIL=noreply@domain.com
DEFAULT_FROM_NAME=App Name
```

## Known Issues Fixed
1. ✅ Exposed credentials in .env.test
2. ✅ Missing rate limiting
3. ✅ No input validation
4. ✅ Webhook security vulnerabilities
5. ✅ Information disclosure in errors
6. ✅ Vercel deployment issues
7. ✅ Shopify connection detection

## Important Configuration Notes

### Shopify App Type (Critical for Launch)
- The app uses `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET`
- Must be a **PUBLIC APP**, not a Custom App
- Custom Apps cannot be distributed or monetized
- See `SHOPIFY_APP_MIGRATION_GUIDE.md` for migration steps

## How to Rollback if Needed

If something breaks in future updates:

```bash
# View this stable version
git log --oneline | grep "0.1.2"

# Rollback to this version
git checkout 4f10950

# Or create a new branch from stable
git checkout -b stable-backup 4f10950
```

## Protected Patterns

These patterns are tested and working - don't change without testing:

1. **Security Middleware** - The order matters in middleware.ts
2. **Rate Limiting** - In-memory store with cleanup
3. **Error Handling** - SafeError patterns prevent leaks
4. **Webhook Validation** - Provider-specific validation
5. **Supabase Client** - Server vs client initialization

## Testing Checklist Before Major Changes

- [ ] Build passes: `npm run build`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Security headers present (check browser)
- [ ] Rate limiting works (test rapid requests)
- [ ] Login/logout works
- [ ] Templates can be saved/loaded
- [ ] API routes return proper errors

---
Last verified working: January 18, 2025