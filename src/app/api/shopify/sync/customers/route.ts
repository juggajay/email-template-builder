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

    // Initialize service and sync customers
    const service = new ShopifyService(connection);
    const syncedCount = await service.syncCustomers(forceSync);

    return NextResponse.json({
      success: true,
      syncedCount,
      message: `Successfully synced ${syncedCount} customers`
    });

  } catch (error) {
    console.error('Customer sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync customers' },
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
    const tag = searchParams.get('tag');

    // Initialize service
    const service = new ShopifyService(connection);
    
    // Get customers
    let customers;
    if (tag) {
      customers = await service.getCustomersByTag(tag);
    } else {
      customers = await service.getCustomers(limit, offset);
    }

    return NextResponse.json({
      success: true,
      customers,
      total: customers.length
    });

  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: 'Failed to get customers' },
      { status: 500 }
    );
  }
}