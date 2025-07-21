'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Store, Link2, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ShopifySettingsConnected } from './shopify-settings-connected';

export function ShopifySettingsSimple() {
  const [shopDomain, setShopDomain] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/shopify/connection');
      if (response.ok) {
        const data = await response.json();
        console.log('Connection check response:', data);
        if (data && data.connection && data.connection.id) {
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setCheckingConnection(false);
    }
  };

  if (checkingConnection) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (isConnected) {
    return <ShopifySettingsConnected />;
  }

  const handleConnect = () => {
    if (!shopDomain.trim()) {
      alert('Please enter your Shopify store domain');
      return;
    }

    setConnecting(true);
    const formattedDomain = shopDomain.includes('.myshopify.com') 
      ? shopDomain 
      : `${shopDomain}.myshopify.com`;
    
    window.location.href = `/api/shopify/auth?shop=${formattedDomain}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5" />
          Shopify Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium">Shopify Store</h4>
              <p className="text-sm text-gray-600">Connect your e-commerce store</p>
            </div>
          </div>
          <Badge variant="outline">Not Connected</Badge>
        </div>

        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-2">
              Store Domain
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                placeholder="mystore"
                onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
              />
              <span className="text-sm text-gray-600">.myshopify.com</span>
            </div>
          </div>

          <Button 
            onClick={handleConnect} 
            className="w-full" 
            disabled={connecting}
          >
            {connecting ? (
              <>Connecting...</>
            ) : (
              <>
                <Link2 className="w-4 h-4 mr-2" />
                Connect Shopify Store
              </>
            )}
          </Button>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p className="font-medium">What happens when you connect:</p>
          <ul className="space-y-1 ml-4">
            <li>• Sync products, customers, and orders</li>
            <li>• Access abandoned cart data</li>
            <li>• Use Shopify data in email templates</li>
            <li>• Real-time webhook updates</li>
          </ul>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ExternalLink className="w-4 h-4" />
          <a 
            href="https://help.shopify.com/en/manual/apps" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-gray-700"
          >
            Learn more about Shopify apps
          </a>
        </div>
      </CardContent>
    </Card>
  );
}