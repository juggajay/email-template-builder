'use client';

import { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { ShopifySettings } from './shopify-settings';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ShopifySettingsErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ShopifySettings error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Shopify Integration Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              There was an error loading the Shopify integration settings.
            </p>
            <Button
              variant="outline"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return <>{this.props.children}</>;
  }
}

export default function ShopifySettingsWrapper() {
  return (
    <ShopifySettingsErrorBoundary>
      <ShopifySettings />
    </ShopifySettingsErrorBoundary>
  );
}