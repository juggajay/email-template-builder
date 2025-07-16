'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TemplateGrid } from '@/components/templates/template-grid';
import { 
  FileText, 
  Plus, 
  Star, 
  TrendingUp, 
  Clock,
  User,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function FileTextsPage() {
  const [viewMode, setViewMode] = useState<'public' | 'my-templates'>('public');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FileTexts</h1>
          <p className="text-gray-600 mt-2">
            Browse our collection of professional email templates or manage your own
          </p>
        </div>
        
        <Link href="/editor">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create FileText
          </Button>
        </Link>
      </div>

      {/* View mode toggle */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center border rounded-lg p-1">
          <Button
            variant={viewMode === 'public' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('public')}
          >
            <Globe className="w-4 h-4 mr-2" />
            Public FileTexts
          </Button>
          <Button
            variant={viewMode === 'my-templates' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('my-templates')}
          >
            <User className="w-4 h-4 mr-2" />
            My FileTexts
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total FileTexts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20+</div>
            <p className="text-xs text-muted-foreground">
              Professional templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Cart Recovery</div>
            <p className="text-xs text-muted-foreground">
              1,234 uses this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Added</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Holiday Sale</div>
            <p className="text-xs text-muted-foreground">
              Added 2 days ago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Exclusive templates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FileText categories overview */}
      {viewMode === 'public' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">🛒</div>
              <h3 className="font-medium">Abandoned Cart</h3>
              <p className="text-sm text-gray-600">5 templates</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="font-medium">Product Launch</h3>
              <p className="text-sm text-gray-600">5 templates</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-medium">Order Confirmation</h3>
              <p className="text-sm text-gray-600">3 templates</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">👋</div>
              <h3 className="font-medium">Welcome</h3>
              <p className="text-sm text-gray-600">3 templates</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-medium">Promotional</h3>
              <p className="text-sm text-gray-600">4 templates</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FileTexts grid */}
      <TemplateGrid 
        showUserTemplates={viewMode === 'my-templates'}
      />
    </div>
  );
}