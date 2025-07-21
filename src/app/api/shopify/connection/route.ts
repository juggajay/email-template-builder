import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ShopifyService } from '@/lib/integrations/shopify/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Connection GET - Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    });
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Shopify connection
    const connection = await ShopifyService.getConnection(user.id);
    console.log('Connection GET - Found connection:', !!connection);

    return NextResponse.json({
      success: true,
      connection
    });

  } catch (error) {
    console.error('Get connection error:', error);
    return NextResponse.json(
      { error: 'Failed to get connection' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current connection
    const connection = await ShopifyService.getConnection(user.id);
    if (!connection) {
      return NextResponse.json(
        { error: 'No connection found' },
        { status: 404 }
      );
    }

    // Delete all related data
    const shopId = connection.id;

    // Delete in order to respect foreign key constraints
    await supabase.from('shopify_webhook_events').delete().eq('shop_id', shopId);
    await supabase.from('shopify_sync_logs').delete().eq('shop_id', shopId);
    await supabase.from('shopify_orders').delete().eq('shop_id', shopId);
    await supabase.from('shopify_abandoned_carts').delete().eq('shop_id', shopId);
    await supabase.from('shopify_customer_segments').delete().eq('shop_id', shopId);
    await supabase.from('shopify_customers').delete().eq('shop_id', shopId);
    await supabase.from('shopify_products').delete().eq('shop_id', shopId);
    
    // Finally delete the connection
    const { error: deleteError } = await supabase
      .from('shopify_connections')
      .delete()
      .eq('id', shopId);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Shopify connection removed successfully'
    });

  } catch (error) {
    console.error('Delete connection error:', error);
    return NextResponse.json(
      { error: 'Failed to delete connection' },
      { status: 500 }
    );
  }
}