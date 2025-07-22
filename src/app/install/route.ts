import { NextRequest, NextResponse } from 'next/server';
import { ShopifyService } from '@/lib/integrations/shopify/service';
import { isValidShopDomain } from '@/lib/integrations/shopify/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shop = searchParams.get('shop');
    
    if (!shop || !isValidShopDomain(shop)) {
      return NextResponse.json(
        { error: 'Invalid shop domain' },
        { status: 400 }
      );
    }

    // Generate OAuth URL immediately - no authentication check, no UI
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/shopify/callback`;
    const { authUrl, state } = ShopifyService.generateAuthUrl(shop, redirectUrl);

    // Store state in session for CSRF protection
    const response = NextResponse.redirect(authUrl);
    response.cookies.set('shopify_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10 // 10 minutes
    });

    return response;

  } catch (error) {
    console.error('Shopify install error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Shopify OAuth' },
      { status: 500 }
    );
  }
}