'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, CheckCircle, RefreshCw, Unlink, Package, Users, ShoppingCart, TrendingUp } from 'lucide-react';

export function ShopifySettingsConnected() {
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadConnection();
  }, []);

  const loadConnection = async () => {
    try {
      const response = await fetch('/api/shopify/connection');
      if (response.ok) {
        const data = await response.json();
        console.log('Connected view - connection data:', data);
        if (data.connection) {
          setConnection(data.connection);
          loadStats();
        }
      }
    } catch (error) {
      console.error('Error loading connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/shopify/sync/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSync = async (type: string) => {
    setSyncing(type);
    try {
      const response = await fetch(`/api/shopify/sync/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceSync: true })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully synced ${data.syncedCount} ${type}`);
        loadStats();
      }
    } catch (error) {
      alert(`Error syncing ${type}`);
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Shopify store?')) return;
    
    try {
      const response = await fetch('/api/shopify/connection', {
        method: 'DELETE'
      });
      if (response.ok) {
        setConnection(null);
        window.location.reload();
      }
    } catch (error) {
      alert('Error disconnecting store');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading connection...</p>
        </CardContent>
      </Card>
    );
  }

  if (!connection) {
    // Fallback to simple connection component
    const { ShopifySettingsSimple } = require('./shopify-settings-simple');
    return <ShopifySettingsSimple />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Shopify Integration
          </CardTitle>
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Store Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">{connection.shop_name}</h4>
          <p className="text-sm text-gray-600">{connection.shop_domain}</p>
          <p className="text-xs text-gray-500 mt-1">
            Connected on {new Date(connection.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Sync Status */}
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-gray-600" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSync('products')}
                  disabled={syncing === 'products'}
                >
                  {syncing === 'products' ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Sync'}
                </Button>
              </div>
              <p className="text-2xl font-bold">{stats.products || 0}</p>
              <p className="text-sm text-gray-600">Products</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-gray-600" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSync('customers')}
                  disabled={syncing === 'customers'}
                >
                  {syncing === 'customers' ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Sync'}
                </Button>
              </div>
              <p className="text-2xl font-bold">{stats.customers || 0}</p>
              <p className="text-sm text-gray-600">Customers</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSync('carts')}
                  disabled={syncing === 'carts'}
                >
                  {syncing === 'carts' ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Sync'}
                </Button>
              </div>
              <p className="text-2xl font-bold">{stats.abandoned_carts || 0}</p>
              <p className="text-sm text-gray-600">Abandoned Carts</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSync('orders')}
                  disabled={syncing === 'orders'}
                >
                  {syncing === 'orders' ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Sync'}
                </Button>
              </div>
              <p className="text-2xl font-bold">{stats.orders || 0}</p>
              <p className="text-sm text-gray-600">Orders</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => handleSync('all')}
            disabled={syncing !== null}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync All Data
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDisconnect}
            className="text-red-600 hover:text-red-700"
          >
            <Unlink className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}