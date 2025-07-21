'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, FileText, Users, BarChart } from 'lucide-react';

export default function ShopifyAppPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<string | null>(null);

  useEffect(() => {
    // Get shop from URL params
    const shopParam = searchParams.get('shop');
    const hostParam = searchParams.get('host');
    
    if (shopParam) {
      setShop(shopParam);
      setLoading(false);
    } else if (hostParam) {
      // Decode host parameter if provided
      try {
        const decodedHost = atob(hostParam);
        const shopMatch = decodedHost.match(/admin\.shopify\.com\/store\/([^\/]+)/);
        if (shopMatch) {
          setShop(shopMatch[1] + '.myshopify.com');
        }
      } catch (e) {
        console.error('Failed to decode host:', e);
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const navigateToApp = () => {
    // Redirect to the main app with shop context
    window.location.href = `/dashboard?shop=${shop}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading ZebaMail...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to ZebaMail
          </h1>
          <p className="text-gray-600">
            Professional email templates for your Shopify store
          </p>
          {shop && (
            <p className="text-sm text-gray-500 mt-2">
              Connected to: {shop}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={navigateToApp}>
            <CardHeader className="pb-3">
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Create and manage beautiful email templates
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={navigateToApp}>
            <CardHeader className="pb-3">
              <Mail className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Send Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Launch targeted email campaigns
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={navigateToApp}>
            <CardHeader className="pb-3">
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Customer Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Target specific customer groups
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={navigateToApp}>
            <CardHeader className="pb-3">
              <BarChart className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle className="text-lg">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Track email performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main CTA */}
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-gray-600 mb-6">
              Create your first email template and start engaging with your customers
            </p>
            <Button 
              size="lg" 
              onClick={navigateToApp}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Open ZebaMail Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Need help? Check out our{' '}
            <a href="/help" target="_blank" className="text-blue-600 hover:underline">
              documentation
            </a>
            {' '}or{' '}
            <a href="/community" target="_blank" className="text-blue-600 hover:underline">
              community forum
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}