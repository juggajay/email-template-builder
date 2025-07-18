export const dynamic = "force-dynamic";
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

    // Get sync statistics
    const [
      productsResult,
      customersResult,
      ordersResult,
      cartsResult
    ] = await Promise.all([
      supabase
        .from('shopify_products')
        .select('id', { count: 'exact', head: true })
        .eq('shop_id', connection.id),
      supabase
        .from('shopify_customers')
        .select('id', { count: 'exact', head: true })
        .eq('shop_id', connection.id),
      supabase
        .from('shopify_orders')
        .select('id', { count: 'exact', head: true })
        .eq('shop_id', connection.id),
      supabase
        .from('shopify_abandoned_carts')
        .select('id', { count: 'exact', head: true })
        .eq('shop_id', connection.id)
        .is('completed_at', null)
    ]);

    const stats = {
      products: productsResult.count || 0,
      customers: customersResult.count || 0,
      orders: ordersResult.count || 0,
      carts: cartsResult.count || 0
    };

    // Get last sync times
    const { data: syncLogs } = await supabase
      .from('shopify_sync_logs')
      .select('sync_type, completed_at')
      .eq('shop_id', connection.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    const lastSyncs: Record<string, string> = {};
    if (syncLogs) {
      syncLogs.forEach(log => {
        if (!lastSyncs[log.sync_type]) {
          lastSyncs[log.sync_type] = log.completed_at;
        }
      });
    }

    return NextResponse.json({
      success: true,
      stats,
      lastSyncs
    });

  } catch (error) {
    console.error('Get sync stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get sync statistics' },
      { status: 500 }
    );
  }
}