import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ShopifyService } from '@/lib/integrations/shopify/service';

export const dynamic = 'force-dynamic';

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
      return NextResponse.json({ 
        success: false,
        products: [],
        message: 'No Shopify connection found' 
      });
    }

    // Initialize service
    const service = new ShopifyService(connection);
    
    // Get products with pagination support
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || undefined;

    let products;
    if (search) {
      products = await service.searchProducts(search);
    } else {
      products = await service.getProducts(limit, offset);
    }

    return NextResponse.json({
      success: true,
      products: products || [],
      total: products?.length || 0
    });

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to get products' },
      { status: 500 }
    );
  }
}