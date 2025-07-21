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

    // Initialize service and sync products
    const service = new ShopifyService(connection);
    const syncedCount = await service.syncProducts(forceSync);

    return NextResponse.json({
      success: true,
      syncedCount,
      message: `Successfully synced ${syncedCount} products`
    });

  } catch (error) {
    console.error('Product sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync products' },
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
    const search = searchParams.get('search');

    // Initialize service
    const service = new ShopifyService(connection);
    
    // Get products
    let products;
    if (search) {
      products = await service.searchProducts(search);
    } else {
      products = await service.getProducts(limit, offset);
    }

    return NextResponse.json({
      success: true,
      products,
      total: products.length
    });

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to get products' },
      { status: 500 }
    );
  }
}