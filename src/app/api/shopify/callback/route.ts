import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ShopifyService } from '@/lib/integrations/shopify/service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shop = searchParams.get('shop');
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const hmac = searchParams.get('hmac');

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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/login?redirect=/settings`
      );
    }

    // Complete OAuth flow
    const connection = await ShopifyService.completeOAuth(shop, code, user.id);

    // Initialize service and setup webhooks
    const service = new ShopifyService(connection);
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    await service.setupWebhooks(baseUrl);

    // Start initial sync in background
    service.syncAll().catch(console.error);

    // Clear OAuth state cookie
    const response = NextResponse.redirect(
      `${baseUrl}/settings?tab=integrations&shopify=connected`
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