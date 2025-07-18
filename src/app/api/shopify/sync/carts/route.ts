import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ShopifyService } from '@/lib/integrations/shopify/service';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Shopify connection
    const connection = await ShopifyService.getConnection(user.id);
    if (!connection) {
      return NextResponse.json(
        { error: 'No Shopify connection found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { forceSync = false } = body;

    // Initialize service and sync abandoned carts
    const service = new ShopifyService(connection);
    const syncedCount = await service.syncAbandonedCarts(forceSync);

    return NextResponse.json({
      success: true,
      syncedCount,
      message: `Successfully synced ${syncedCount} abandoned carts`
    });

  } catch (error) {
    console.error('Abandoned cart sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync abandoned carts' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Shopify connection
    const connection = await ShopifyService.getConnection(user.id);
    if (!connection) {
      return NextResponse.json(
        { error: 'No Shopify connection found' },
        { status: 404 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const email = searchParams.get('email');

    // Initialize service
    const service = new ShopifyService(connection);
    
    // Get abandoned carts
    let carts;
    if (email) {
      const cart = await service.getAbandonedCartByEmail(email);
      carts = cart ? [cart] : [];
    } else {
      carts = await service.getAbandonedCarts(limit, offset);
    }

    return NextResponse.json({
      success: true,
      carts,
      total: carts.length
    });

  } catch (error) {
    console.error('Get abandoned carts error:', error);
    return NextResponse.json(
      { error: 'Failed to get abandoned carts' },
      { status: 500 }
    );
  }
}