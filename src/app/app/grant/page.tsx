'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, FileText, Users, BarChart, Store, CheckCircle } from 'lucide-react';

function GrantAppContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<string | null>(null);

  useEffect(() => {
    // Get shop from URL params
    const shopParam = searchParams.get('shop');
    const hostParam = searchParams.get('host');
    const oauthComplete = searchParams.get('oauth_complete');
    
    if (shopParam) {
      setShop(shopParam);
      
      // If OAuth just completed, redirect to Shopify admin
      if (oauthComplete === 'true') {
        const shopId = shopParam.replace('.myshopify.com', '');
        // Use window.location.replace to do a full page redirect
        window.location.replace(`https://admin.shopify.com/store/${shopId}/app/grant`);
        return;
      }
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
    }
    
    setLoading(false);
  }, [searchParams]);

  const navigateToSection = (section: string) => {
    // When embedded in Shopify admin, we need to use the shop parameter
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    window.location.href = `${baseUrl}/${section}?shop=${shop}`;
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
        {/* Welcome Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Store className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">ZebaMail for Shopify</h1>
          </div>
          <p className="text-gray-600">
            Professional email marketing for your e-commerce store
          </p>
          {shop && (
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Connected to: {shop}
            </div>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500"
            onClick={() => navigateToSection('templates')}
          >
            <CardHeader className="pb-3">
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Design beautiful email templates with our drag-and-drop editor
              </p>
              <Button className="mt-3 w-full" variant="outline" size="sm">
                Browse Templates
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-500"
            onClick={() => navigateToSection('campaigns')}
          >
            <CardHeader className="pb-3">
              <Mail className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Send targeted email campaigns to your customers
              </p>
              <Button className="mt-3 w-full" variant="outline" size="sm">
                Create Campaign
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-500"
            onClick={() => navigateToSection('customers')}
          >
            <CardHeader className="pb-3">
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Create customer segments for targeted marketing
              </p>
              <Button className="mt-3 w-full" variant="outline" size="sm">
                View Segments
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-500"
            onClick={() => navigateToSection('analytics')}
          >
            <CardHeader className="pb-3">
              <BarChart className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle className="text-lg">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Track performance and optimize your campaigns
              </p>
              <Button className="mt-3 w-full" variant="outline" size="sm">
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Getting Started with ZebaMail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Create Your First Template</h4>
                <p className="text-sm text-gray-600">
                  Use our drag-and-drop editor to design professional email templates
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold">Import Your Customers</h4>
                <p className="text-sm text-gray-600">
                  Automatically sync your Shopify customers and order data
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold">Send Your First Campaign</h4>
                <p className="text-sm text-gray-600">
                  Launch targeted campaigns to engage your customers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main CTA */}
        <Card className="text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">Ready to boost your sales?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Start creating beautiful email campaigns that convert. Our Shopify integration 
              makes it easy to sync your products, customers, and orders.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigateToSection('dashboard')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Footer Help */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Need help? Visit our{' '}
            <a href="/help" className="text-blue-600 hover:underline">
              Help Center
            </a>
            {' '}or contact{' '}
            <a href="mailto:support@zebamail.com" className="text-blue-600 hover:underline">
              support@zebamail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GrantAppPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <GrantAppContent />
    </Suspense>
  );
}