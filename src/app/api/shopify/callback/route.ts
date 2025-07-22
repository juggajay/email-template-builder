import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ShopifyService } from '@/lib/integrations/shopify/service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('Shopify callback hit:', request.url);
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const shop = searchParams.get('shop');
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const hmac = searchParams.get('hmac');
    
    console.log('Callback params:', { shop, code, state, hmac });

    if (!shop || !code || !state || !hmac) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/settings?error=missing_params`
      );
    }

    // Verify state for CSRF protection
    const storedState = request.cookies.get('shopify_oauth_state')?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/settings?error=invalid_state`
      );
    }

    // Verify HMAC
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const isValid = await ShopifyService.verifyCallback(params);
    if (!isValid) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/settings?error=invalid_hmac`
      );
    }

    // Check authentication
    const supabase = createClient();
    console.log('Checking authentication in Shopify callback...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth check result:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    });
    
    if (authError || !user) {
      console.error('No authenticated user in Shopify callback:', authError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/login?redirect=/settings`
      );
    }

    // Complete OAuth flow
    console.log('About to call completeOAuth with:', { shop, code, userId: user.id });
    const connection = await ShopifyService.completeOAuth(shop, code, user.id);
    
    console.log('Connection returned from completeOAuth:', {
      connectionId: connection.id,
      hasShopDomain: !!(connection as any).shop_domain || !!connection.shopDomain,
      hasAccessToken: !!(connection as any).access_token || !!connection.accessToken,
      connectionKeys: Object.keys(connection)
    });

    // Initialize service and setup webhooks
    const service = new ShopifyService(connection);
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Try to setup webhooks but don't fail if it doesn't work
    try {
      await service.setupWebhooks(baseUrl);
      console.log('Webhooks setup successfully');
    } catch (webhookError) {
      console.error('Failed to setup webhooks (non-critical):', webhookError);
      // Continue anyway - webhooks are nice to have but not required
    }

    // Start initial sync in background
    service.syncAll().catch(error => {
      console.error('Background sync failed:', error);
    });

    // Extract shop ID by removing .myshopify.com
    const shopId = shop.replace('.myshopify.com', '');
    
    // CRITICAL: Redirect to Shopify admin, NOT your website
    const response = NextResponse.redirect(
      `https://admin.shopify.com/store/${shopId}/app/grant`
    );
    response.cookies.delete('shopify_oauth_state');

    return response;

  } catch (error) {
    console.error('Shopify callback error:', error);
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${baseUrl}/settings?error=connection_failed`
    );
  }
}