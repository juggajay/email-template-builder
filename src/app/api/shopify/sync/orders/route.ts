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

    // Initialize service and sync orders
    const service = new ShopifyService(connection);
    const syncedCount = await service.syncOrders(forceSync);

    return NextResponse.json({
      success: true,
      syncedCount,
      message: `Successfully synced ${syncedCount} orders`
    });

  } catch (error) {
    console.error('Order sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync orders' },
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
    const customerId = searchParams.get('customerId');

    // Initialize service
    const service = new ShopifyService(connection);
    
    // Get orders
    let orders;
    if (customerId) {
      orders = await service.getOrdersByCustomer(customerId);
    } else {
      orders = await service.getOrders(limit, offset);
    }

    return NextResponse.json({
      success: true,
      orders,
      total: orders.length
    });

  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to get orders' },
      { status: 500 }
    );
  }
}