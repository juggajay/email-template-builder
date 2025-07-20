# ZebaMail Launch Checklist 🚀

## Domain Setup ✅
- [x] Domain registered: zebamail.com
- [ ] DNS configured in domain registrar
- [ ] Domain added to Vercel
- [ ] SSL certificate active

## Vercel Configuration
- [ ] Add custom domain in Vercel dashboard
- [ ] Update environment variables:
  ```
  NEXT_PUBLIC_APP_URL=https://www.zebamail.com
  NEXT_PUBLIC_BASE_URL=https://www.zebamail.com
  SHOPIFY_CLIENT_ID=your_new_client_id
  SHOPIFY_CLIENT_SECRET=your_new_secret
  ```
- [ ] Trigger new deployment
- [ ] Verify site loads at zebamail.com

## Shopify App Configuration
- [ ] Update App URL to https://www.zebamail.com
- [ ] Update Redirect URLs:
  - https://www.zebamail.com/api/shopify/callback
  - https://zebamail.com/api/shopify/callback
- [ ] Update Webhook URL to https://www.zebamail.com/api/shopify/webhooks
- [ ] Test OAuth flow with development store

## Email Configuration
- [ ] Set up email domain (noreply@zebamail.com)
- [ ] Configure SPF/DKIM records
- [ ] Update DEFAULT_FROM_EMAIL in Vercel
- [ ] Test email sending

## Testing Checklist
- [ ] Homepage loads at zebamail.com
- [ ] Login/signup works
- [ ] Can create and save templates
- [ ] Shopify OAuth connection works
- [ ] Products sync from Shopify
- [ ] Email preview works
- [ ] Security headers present

## Branding Updates
- [ ] Update app name in UI
- [ ] Update meta tags for SEO
- [ ] Update favicon
- [ ] Update email templates with ZebaMail branding

## Production Readiness
- [ ] Run database migrations (security_logs table)
- [ ] Verify all environment variables set
- [ ] Test rate limiting works
- [ ] Check error pages (404, 500)
- [ ] Verify mobile responsiveness

## Launch Steps
1. **Soft Launch**
   - [ ] Test with 5-10 beta users
   - [ ] Monitor error logs
   - [ ] Gather feedback

2. **Public Launch**
   - [ ] Announce on social media
   - [ ] Submit to Shopify app directories
   - [ ] Set up analytics tracking

## Post-Launch
- [ ] Monitor Vercel logs for errors
- [ ] Check security logs in Supabase
- [ ] Set up uptime monitoring
- [ ] Plan first feature updates

---

## Quick Commands

### Test your domain:
```bash
# Check DNS
nslookup zebamail.com

# Check SSL
curl -I https://www.zebamail.com

# Check API
curl https://www.zebamail.com/api/health
```

### Monitor deployment:
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://app.supabase.com
- Shopify Partners: https://partners.shopify.com

---

🎉 You're almost ready to launch! Complete this checklist and ZebaMail will be live!