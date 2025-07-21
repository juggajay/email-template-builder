# Local Shopify OAuth Test Guide

## Prerequisites
1. Development server running on http://localhost:3000
2. Valid Shopify development store
3. Shopify app credentials in `.env.local`

## Test Steps

### 1. Start OAuth Flow
1. Open your browser in **Incognito/Private mode** (to avoid cookie conflicts)
2. Go to: http://localhost:3000/settings
3. Log in to your ZebaMail account
4. Navigate to **Settings → Integrations**

### 2. Connect Shopify
1. Enter your test store domain (e.g., `xbbf0y-vp` or `xbbf0y-vp.myshopify.com`)
2. Click "Connect Shopify Store"
3. You should be redirected to Shopify's OAuth page

### 3. Monitor the Redirect
Use browser DevTools to track redirects:

1. Open DevTools (F12)
2. Go to **Network** tab
3. Check "Preserve log"
4. Complete the OAuth flow

### 4. Expected Behavior

**After clicking "Install app" on Shopify:**

❌ **Wrong (Old behavior):**
- Redirects to: `https://www.zebamail.com/?hmac=...`
- Or: `http://localhost:3000/?hmac=...`

✅ **Correct (New behavior):**
- Redirects to: `https://admin.shopify.com/store/{shop-id}/app/grant`
- Example: `https://admin.shopify.com/store/xbbf0y-vp/app/grant`

### 5. Debug Checklist

If still redirecting to homepage:

1. **Check console logs**
   - Look for any JavaScript errors
   - Check for redirect logs

2. **Verify environment variables**
   ```bash
   echo $SHOPIFY_APP_HANDLE
   # Should output: grant
   ```

3. **Check the callback URL**
   - In Network tab, find the request to `/api/shopify/callback`
   - Check the Response Headers for `Location`
   - It should be the Shopify admin URL

4. **Clear all cookies**
   - Sometimes old OAuth state can interfere
   - Use incognito mode or clear site data

### 6. Manual API Test

You can test the callback endpoint directly:

```bash
# Test the redirect logic
curl -I "http://localhost:3000/api/shopify/callback?shop=xbbf0y-vp.myshopify.com&code=test&state=test&hmac=test"
```

Look for the `Location` header in the response.

### 7. Common Issues

1. **Old code cached**: Hard refresh (Ctrl+Shift+R)
2. **Environment not loaded**: Restart dev server
3. **Wrong app handle**: Check SHOPIFY_APP_HANDLE env var
4. **Auth issues**: Make sure you're logged in to ZebaMail first

## Production Test

Once working locally:
1. Deploy to Vercel
2. Update production env vars
3. Test with Shopify's automated test
4. Should redirect to: `https://admin.shopify.com/store/xbbf0y-vp/app/grant`