'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Store, 
  Link2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Settings,
  Loader2,
  ExternalLink,
  Unlink
} from 'lucide-react';
import { formatPrice, formatOrderStatus } from '@/lib/integrations/shopify/utils';

export function ShopifySettings() {
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncStats, setSyncStats] = useState<any>(null);
  const [shopDomain, setShopDomain] = useState('');
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    loadConnection();
  }, []);

  const loadConnection = async () => {
    try {
      const response = await fetch('/api/shopify/connection');
      if (response.ok) {
        const data = await response.json();
        setConnection(data.connection);
        if (data.connection) {
          loadSyncStats();
        }
      }
    } catch (error) {
      console.error('Failed to load connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSyncStats = async () => {
    try {
      const response = await fetch('/api/shopify/sync/stats');
      if (response.ok) {
        const data = await response.json();
        setSyncStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load sync stats:', error);
    }
  };

  const handleConnect = () => {
    if (!shopDomain.trim()) {
      alert('Please enter your Shopify store domain');
      return;
    }

    // Format domain if needed
    let formattedDomain = shopDomain.trim().toLowerCase();
    if (!formattedDomain.includes('.myshopify.com')) {
      formattedDomain = `${formattedDomain}.myshopify.com`;
    }

    // Redirect to OAuth flow
    window.location.href = `/api/shopify/auth?shop=${formattedDomain}`;
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
        loadSyncStats();
      } else {
        alert(`Failed to sync ${type}`);
      }
    } catch (error) {
      alert(`Error syncing ${type}`);
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Shopify store? This will remove all synced data.')) {
      return;
    }

    setDisconnecting(true);
    try {
      const response = await fetch('/api/shopify/connection', {
        method: 'DELETE'
      });

      if (response.ok) {
        setConnection(null);
        setSyncStats(null);
        setShopDomain('');
      } else {
        alert('Failed to disconnect store');
      }
    } catch (error) {
      alert('Error disconnecting store');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!connection) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8" />
            <div>
              <CardTitle>Connect Your Shopify Store</CardTitle>
              <CardDescription>
                Sync products, customers, and orders to enhance your email campaigns
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              You'll be redirected to Shopify to authorize the connection. Make sure you have admin access to your store.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="shop-domain">Store Domain</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="shop-domain"
                placeholder="mystore"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
              />
              <span className="flex items-center text-sm text-gray-600">.myshopify.com</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter your store name without the .myshopify.com part
            </p>
          </div>

          <Button onClick={handleConnect} className="w-full" size="lg">
            <Link2 className="w-4 h-4 mr-2" />
            Connect Shopify Store
          </Button>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">What gets synced?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Products with images, prices, and inventory</li>
              <li>✓ Customer data and purchase history</li>
              <li>✓ Abandoned carts for recovery campaigns</li>
              <li>✓ Order information and fulfillment status</li>
              <li>✓ Real-time updates via webhooks</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="w-6 h-6" />
              <div>
                <CardTitle>{connection.shop_name || connection.shop_domain}</CardTitle>
                <CardDescription>
                  Connected on {new Date(connection.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Connected
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="sync">Sync Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Sync Stats */}
          {syncStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Products</p>
                      <p className="text-2xl font-bold">{syncStats.products}</p>
                    </div>
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Customers</p>
                      <p className="text-2xl font-bold">{syncStats.customers}</p>
                    </div>
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Orders</p>
                      <p className="text-2xl font-bold">{syncStats.orders}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Abandoned Carts</p>
                      <p className="text-2xl font-bold">{syncStats.carts}</p>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Shop Info */}
          <Card>
            <CardHeader>
              <CardTitle>Shop Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Shop Domain</p>
                  <p className="font-medium">{connection.shop_domain}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shop Plan</p>
                  <p className="font-medium">{connection.shop_plan || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shop Email</p>
                  <p className="font-medium">{connection.shop_email || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shop Owner</p>
                  <p className="font-medium">{connection.shop_owner || 'Unknown'}</p>
                </div>
              </div>
              <div className="pt-3 flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://${connection.shop_domain}/admin`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Shopify Admin
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Sync</CardTitle>
                  <CardDescription>
                    Manage product data synchronization
                  </CardDescription>
                </div>
                <Button
                  onClick={() => handleSync('products')}
                  disabled={syncing === 'products'}
                >
                  {syncing === 'products' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Sync Products
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Auto-sync products</span>
                  <Badge>Every 6 hours</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Include draft products</span>
                  <Badge variant="secondary">No</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Sync product images</span>
                  <Badge variant="default">Yes</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Customer Sync</CardTitle>
                  <CardDescription>
                    Manage customer data synchronization
                  </CardDescription>
                </div>
                <Button
                  onClick={() => handleSync('customers')}
                  disabled={syncing === 'customers'}
                >
                  {syncing === 'customers' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Sync Customers
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Auto-sync customers</span>
                  <Badge>Every 24 hours</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Sync customer tags</span>
                  <Badge variant="default">Yes</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Sync order history</span>
                  <Badge variant="default">Yes</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>
                Create segments for targeted email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Manage Customer Segments
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
              <CardDescription>
                Configure data synchronization preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Sync All Data</h4>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSync('products')}
                    disabled={syncing !== null}
                    variant="outline"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Products
                  </Button>
                  <Button
                    onClick={() => handleSync('customers')}
                    disabled={syncing !== null}
                    variant="outline"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Customers
                  </Button>
                  <Button
                    onClick={() => handleSync('orders')}
                    disabled={syncing !== null}
                    variant="outline"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Orders
                  </Button>
                  <Button
                    onClick={() => handleSync('carts')}
                    disabled={syncing !== null}
                    variant="outline"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Carts
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Webhook Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Webhooks configured</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Real-time updates are enabled for products, customers, and orders
                  </p>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Large stores may take several minutes to sync all data. Sync happens in the background.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}