'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemplateGrid } from '@/components/templates/template-grid';
import { 
  Globe,
  User
} from 'lucide-react';
import { StripePattern } from '@/components/brand';
import {
  GeometricCartIcon,
  GeometricRocketIcon,
  GeometricShieldIcon,
  GeometricWaveIcon,
  GeometricMegaphoneIcon
} from '@/components/brand/CategoryIcons';

export const dynamic = 'force-dynamic';

export default function TemplatesPage() {
  const [viewMode, setViewMode] = useState<'public' | 'my-templates'>('public');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zebra-black">Templates Library</h1>
        <p className="text-gray-700 mt-2">
          Choose from our collection of email templates
        </p>
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
            Public Templates
          </Button>
          <Button
            variant={viewMode === 'my-templates' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('my-templates')}
          >
            <User className="w-4 h-4 mr-2" />
            My Templates
          </Button>
        </div>
      </div>

      {/* Template categories */}
      {viewMode === 'public' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden hover:border-success-purple/30">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <StripePattern animation="static" opacity={0.05} color="#6b5fd4" />
            </div>
            <CardContent className="p-4 text-center relative z-10">
              <div className="inline-flex p-3 rounded-lg bg-success-purple/10 text-success-purple mb-3">
                <GeometricCartIcon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-zebra-black">Abandoned Cart</h3>
              <p className="text-xs text-gray-600 mt-1">Recover lost revenue</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden hover:border-growth-green/30">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <StripePattern animation="static" opacity={0.05} color="#00d4aa" />
            </div>
            <CardContent className="p-4 text-center relative z-10">
              <div className="inline-flex p-3 rounded-lg bg-growth-green/10 text-growth-green mb-3">
                <GeometricRocketIcon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-zebra-black">Product Launch</h3>
              <p className="text-xs text-gray-600 mt-1">Launch day sales</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden hover:border-trust-blue/30">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <StripePattern animation="static" opacity={0.05} color="#0066ff" />
            </div>
            <CardContent className="p-4 text-center relative z-10">
              <div className="inline-flex p-3 rounded-lg bg-trust-blue/10 text-trust-blue mb-3">
                <GeometricShieldIcon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-zebra-black">Order Confirmation</h3>
              <p className="text-xs text-gray-600 mt-1">Build trust</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden hover:border-growth-green/30">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <StripePattern animation="static" opacity={0.05} color="#00d4aa" />
            </div>
            <CardContent className="p-4 text-center relative z-10">
              <div className="inline-flex p-3 rounded-lg bg-growth-green/10 text-growth-green mb-3">
                <GeometricWaveIcon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-zebra-black">Welcome Series</h3>
              <p className="text-xs text-gray-600 mt-1">Convert subscribers</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden hover:border-alert-amber/30">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <StripePattern animation="static" opacity={0.05} color="#ffb800" />
            </div>
            <CardContent className="p-4 text-center relative z-10">
              <div className="inline-flex p-3 rounded-lg bg-alert-amber/10 text-alert-amber mb-3">
                <GeometricMegaphoneIcon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-zebra-black">Promotional</h3>
              <p className="text-xs text-gray-600 mt-1">Time-sensitive offers</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates grid */}
      <TemplateGrid 
        showUserTemplates={viewMode === 'my-templates'}
      />
    </div>
  );
}