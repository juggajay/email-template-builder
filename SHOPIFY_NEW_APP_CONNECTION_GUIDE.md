# Shopify New App Connection Guide

## Steps to Connect Your New Public Shopify App

### 1. Update Environment Variables

First, add your new Shopify app credentials to your `.env.local` file:

```bash
# Add these to your .env.local file
SHOPIFY_CLIENT_ID=your-new-public-app-client-id
SHOPIFY_CLIENT_SECRET=your-new-public-app-client-secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # or your production URL
```

### 2. Verify Shopify App Settings

In your Shopify Partners Dashboard for your new public app, ensure you have:

**App URLs:**
- App URL: `https://your-domain.com` (or `http://localhost:3000` for development)

**Allowed redirection URLs:**
- `http://localhost:3000/api/shopify/callback` (for development)
- `https://your-domain.com/api/shopify/callback` (for production)

**Required API Scopes:**
The app will request these scopes automatically:
- read_products, write_products
- read_customers, write_customers
- read_orders, write_orders
- read_checkouts, write_checkouts
- read_inventory, write_inventory

### 3. Disconnect Current App (if connected)

If you're already connected to a Shopify store:

1. Go to http://localhost:3000/settings
2. Click on the "Integrations" tab
3. Find the Shopify integration
4. Click "Disconnect" button

Or manually clear the connection from the database.

### 4. Connect New App

1. Restart your development server to load new environment variables:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:3000/settings

3. Click on the "Integrations" tab

4. In the Shopify integration section:
   - Enter your store domain (e.g., `mystore` or `mystore.myshopify.com`)
   - Click "Connect Shopify Store"

5. You'll be redirected to Shopify to authorize the app

6. After authorization, you'll be redirected back to your app

### 5. Verify Connection

After connecting, the integration page should show:
- Your store name
- Store domain
- Connection status (Connected)
- Number of products, customers, carts, and orders
- Connection details (to help identify which app version)

### 6. Initial Data Sync

Click "Sync All Data" to import your Shopify data:
- Products
- Customers
- Orders
- Abandoned Carts

### Troubleshooting

**If connection fails:**
1. Check browser console for errors
2. Verify environment variables are set correctly
3. Ensure your app URLs in Shopify Partners match your local/production URLs
4. Check that your app is not in test mode if trying to connect a real store

**Common Issues:**
- "Invalid shop domain" - Ensure you're using the correct format: `mystore.myshopify.com`
- "Unauthorized" - Make sure you're logged into ZebaMail first
- OAuth errors - Double-check your redirect URLs in Shopify Partners dashboard

### Important Notes

1. **Public App vs Custom App**: Ensure you're using a PUBLIC app from Shopify Partners, not a Custom App from a store's admin
2. **Development vs Production**: Use separate apps for development and production environments
3. **API Version**: The app uses Shopify's latest stable API version