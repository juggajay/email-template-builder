# Critical Files Map - DO NOT DELETE

## 🔴 Security Files (Added Jan 18, 2025)
These files implement critical security features:

### /src/lib/security/
- `rate-limit.ts` - Prevents DDoS/abuse (in-memory store)
- `validation.ts` - Input validation with Zod schemas  
- `webhook-validation.ts` - Prevents webhook spoofing
- `error-handling.ts` - Prevents information disclosure
- `monitoring.ts` - Security event logging

### /src/middleware.ts
- Security headers (CSP, HSTS, etc.)
- Runs on EVERY request
- Order matters - don't reorganize

## 🟡 Core Application Files

### /src/components/editor/
- `unlayer-wrapper-fixed.tsx` - Main editor (DO NOT rename)
- `mobile-editor-wrapper.tsx` - Mobile responsive wrapper
- Other wrapper files - Different editor implementations

### /src/app/api/
All API routes with security applied:
- `auth/session/` - Authentication endpoints
- `email/send/` - Email sending with validation
- `templates/` - Template CRUD operations
- `stripe/webhooks/` - Payment webhooks
- `shopify/webhooks/` - Shopify integration

### /src/lib/
- `supabase/client.ts` - Client-side Supabase
- `supabase/server.ts` - Server-side Supabase  
- `supabase/middleware.ts` - Auth middleware

## 🟢 Configuration Files

### Root Directory
- `.env.production.example` - Template for env vars
- `vercel.json` - Vercel deployment settings
- `.vercelignore` - Controls what deploys
- `package.json` - Dependencies and scripts

### Database
- `/supabase/migrations/20240118_security_logs_table.sql`
- Must be run in production Supabase

## ⚠️ Files That Look Temporary But Aren't
- `unlayer-wrapper-fixed.tsx` - Despite the name, this is the MAIN editor
- `page-fixed.tsx` files - These are the working versions

## 🗑️ Safe to Delete
- `COMPLETE_*.md` - Documentation files
- `*_FIX.sql` - Old fix scripts
- `test-*.js` - Test scripts
- `.env.test` - Test environment (already using fake values)

## 💡 Understanding the Architecture

### Request Flow:
1. Request → middleware.ts (security headers)
2. → API route (rate limiting)
3. → Input validation
4. → Business logic
5. → Error handling
6. → Response

### Security Layers:
1. **Edge**: Security headers, CORS
2. **API**: Rate limiting per endpoint
3. **Input**: Zod validation schemas
4. **Logic**: Safe error handling
5. **Output**: No information disclosure

### Why These Patterns:
- **In-memory rate limiting**: Works on Vercel without Redis
- **Zod validation**: Type-safe runtime validation
- **SafeError class**: Prevents stack trace leaks
- **Webhook validation**: Each provider has different methods

---
If you need to modify any of these files, understand their purpose first!