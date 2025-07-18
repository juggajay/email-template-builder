import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ShopifyService } from '@/lib/integrations/shopify/service';

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

    // Initialize service
    const service = new ShopifyService(connection);
    const segments = await service.getCustomerSegments();

    // Add some predefined segments
    const predefinedSegments = [
      {
        id: 'all-customers',
        name: 'All Customers',
        query: '',
        customer_count: 0
      },
      {
        id: 'accepts-marketing',
        name: 'Accepts Marketing',
        query: 'accepts_marketing:true',
        customer_count: 0
      },
      {
        id: 'repeat-customers',
        name: 'Repeat Customers',
        query: 'orders_count:>1',
        customer_count: 0
      },
      {
        id: 'high-value',
        name: 'High Value Customers',
        query: 'total_spent:>500',
        customer_count: 0
      },
      {
        id: 'abandoned-cart',
        name: 'Has Abandoned Cart',
        query: 'has_abandoned_checkout:true',
        customer_count: 0
      }
    ];

    return NextResponse.json({
      success: true,
      segments: [...predefinedSegments, ...segments]
    });

  } catch (error) {
    console.error('Get segments error:', error);
    return NextResponse.json(
      { error: 'Failed to get customer segments' },
      { status: 500 }
    );
  }
}

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
    const { name, query } = body;

    if (!name || !query) {
      return NextResponse.json(
        { error: 'Name and query are required' },
        { status: 400 }
      );
    }

    // Save segment
    const { error } = await supabase
      .from('shopify_customer_segments')
      .insert({
        shop_id: connection.id,
        name,
        query,
        customer_count: 0
      });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Segment created successfully'
    });

  } catch (error) {
    console.error('Create segment error:', error);
    return NextResponse.json(
      { error: 'Failed to create segment' },
      { status: 500 }
    );
  }
}