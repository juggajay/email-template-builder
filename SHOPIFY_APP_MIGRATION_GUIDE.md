# Shopify Custom App to Public App Migration Guide

## 🚨 Critical Issue: Custom App Limitations
Your current Shopify app is configured as a **Custom App** which has severe limitations:
- ❌ Can only be installed on stores in the same Plus organization
- ❌ Cannot charge merchants (Billing API disabled)
- ❌ Cannot be changed to public (Shopify restriction)
- ❌ Blocking your launch to wider market

## ✅ Solution: Create a Public App
This guide walks you through migrating to a Public App without any code changes.

## Step 1: Create New Public App (30 minutes)

1. **Go to Shopify Partners Dashboard**
   - URL: https://partners.shopify.com
   - Log in with your partner account

2. **Create New App**
   - Click "Apps" → "Create app"
   - Choose **"Public app"** (NOT custom)
   - App name: "Email Template Builder" (or your preferred name)

3. **Set Distribution**
   - Choose "Limited visibility"
   - This avoids the app review process
   - You can still install on any store

## Step 2: Configure App Settings

### App URLs Configuration
```
App URL: https://your-app.vercel.app
Redirect URLs:
- https://your-app.vercel.app/api/shopify/callback
- http://localhost:3000/api/shopify/callback

Webhook URL: https://your-app.vercel.app/api/shopify/webhooks
```

### Required OAuth Scopes
Copy these exact scopes from your current app:
- `read_products`
- `write_products`
- `read_customers`
- `write_customers`
- `read_orders`
- `write_orders`
- `read_checkouts`
- `write_checkouts`
- `read_inventory`
- `write_inventory`

### Webhook Subscriptions
Configure these webhook topics:
- `products/create`
- `products/update`
- `customers/create`
- `customers/update`
- `orders/create`
- `checkouts/create`

## Step 3: Get Your New Credentials

After creating the app, you'll get:
- **Client ID**: Looks like `1234567890abcdef1234567890abcdef`
- **Client Secret**: Looks like `shpss_1234567890abcdef1234567890abcdef`

⚠️ **IMPORTANT**: Keep the Client Secret secure!

## Step 4: Update Environment Variables

### Local Development (.env.local)
```env
# Replace these with your new Public App credentials
SHOPIFY_CLIENT_ID=your_new_client_id_here
SHOPIFY_CLIENT_SECRET=your_new_client_secret_here
```

### Vercel Dashboard
1. Go to your Vercel project
2. Settings → Environment Variables
3. Update:
   - `SHOPIFY_CLIENT_ID` → Your new Client ID
   - `SHOPIFY_CLIENT_SECRET` → Your new Client Secret
4. Redeploy for changes to take effect

## Step 5: Test the Migration

### Test OAuth Flow
1. Use a development store
2. Visit: `https://your-app.vercel.app/settings`
3. Click "Connect Shopify"
4. Should redirect to Shopify OAuth
5. Approve the app
6. Should redirect back successfully

### Verify Functionality
- ✅ OAuth connection works
- ✅ Products sync correctly
- ✅ Customer data loads
- ✅ Webhooks are created

## Step 6: Migrate Existing Connections (If Any)

If you have existing stores connected via the Custom App:
1. They need to disconnect the old app
2. Reconnect using the new Public App
3. All data will resync automatically

## 🎉 Benefits After Migration

### Immediate Benefits
- ✅ **Any Shopify store can install** (not restricted to organization)
- ✅ **Ready for launch** to broader market
- ✅ **Can implement billing** when ready

### Future Options
- Can add to Shopify App Store
- Can implement Shopify Billing API
- Can request additional scopes
- Can monetize the app

## 🔧 Troubleshooting

### "Invalid API key or access token"
- Double-check credentials in environment variables
- Ensure you're using Client ID, not API key

### "Invalid redirect_uri"
- Add your callback URL in app settings
- Must match exactly (including https://)

### OAuth Error
- Check scopes match exactly
- Verify redirect URLs are correct
- Ensure NEXT_PUBLIC_BASE_URL is set

## 📝 Important Notes

1. **Keep Both Apps Initially**
   - Don't delete the Custom App yet
   - Use it as reference for settings
   - Delete only after migration complete

2. **No Code Changes Required**
   - The codebase already uses correct variable names
   - OAuth flow is already public app compatible
   - Just swap the credentials

3. **Security**
   - Never commit credentials to git
   - Use environment variables only
   - Rotate secrets if exposed

## 🚀 Next Steps After Migration

1. **Test with Multiple Stores**
   - Install on 2-3 test stores
   - Verify all features work

2. **Plan Your Launch**
   - Can now onboard any Shopify merchant
   - Consider pricing strategy
   - Plan marketing approach

3. **Future Enhancements**
   - Implement Shopify Billing API
   - Add to Shopify App Store
   - Build merchant onboarding flow

---

**Need Help?**
- Shopify Partners Support: https://help.shopify.com/en/partners
- API Documentation: https://shopify.dev/docs/apps

Remember: This migration unlocks your ability to scale beyond a single organization!