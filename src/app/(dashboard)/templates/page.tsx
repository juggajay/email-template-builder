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
import { ZebCharacter, StripePattern, GrowthMetric } from '@/components/brand';
import { 
  TargetIcon,
  ChartIcon,
  TrendingUpIcon as GeometricTrendingUpIcon,
  RefreshIcon
} from '@/components/brand/GeometricIcons';
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
      <div className="relative">
        {/* Animated stripe pattern background */}
        <div className="absolute inset-0 -mx-8 -mt-6 h-32 overflow-hidden">
          <StripePattern animation="parallax" speed="slow" opacity={0.06} color="#00d4aa" />
        </div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zebra-black">Templates Library</h1>
            <p className="text-gray-700 mt-2 font-medium">
              Revenue-driving templates that scale with your growth
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/editor">
              <Button className="bg-growth-green hover:bg-growth-green-600 text-white">
                <TargetIcon className="w-4 h-4 mr-2" />
                Create Growth Template
              </Button>
            </Link>
            <ZebCharacter variant="peek" size="md" className="hidden lg:block" />
          </div>
        </div>
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

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-growth-green/20 group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <StripePattern animation="static" opacity={0.03} color="#00d4aa" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-700">Revenue-Tested Templates</CardTitle>
            <div className="p-2 rounded-lg bg-growth-green/10 text-growth-green">
              <TargetIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-growth-green">20+</div>
            <p className="text-xs text-gray-600">
              Each averaging 3.2% conversion
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-success-purple/20 group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <StripePattern animation="static" opacity={0.03} color="#6b5fd4" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-700">Top Performer</CardTitle>
            <div className="p-2 rounded-lg bg-success-purple/10 text-success-purple">
              <ChartIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-zebra-black">Cart Recovery</div>
            <p className="text-xs text-gray-600">
              $24.5K average monthly recovery
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-growth-green/20 group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <StripePattern animation="static" opacity={0.03} color="#00d4aa" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-700">New High-Performer</CardTitle>
            <div className="p-2 rounded-lg bg-growth-green/10 text-growth-green">
              <GeometricTrendingUpIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-zebra-black">Holiday Sale</div>
            <p className="text-xs text-gray-600">
              4.8% conversion in first week
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-alert-amber/20 group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <StripePattern animation="static" opacity={0.03} color="#ffb800" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-700">Enterprise Growth</CardTitle>
            <div className="p-2 rounded-lg bg-alert-amber/10 text-alert-amber">
              <RefreshIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-zebra-black">5</div>
            <p className="text-xs text-gray-600">
              For scaling past $1M/month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Template categories overview */}
      {viewMode === 'public' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-zebra-black">Choose Your Growth Path</h2>
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
                <p className="text-xs text-gray-600 mt-1">Recover 15-25% of lost revenue</p>
                <p className="text-sm font-medium text-success-purple mt-2">5 proven templates</p>
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
                <p className="text-xs text-gray-600 mt-1">Drive 3x launch day sales</p>
                <p className="text-sm font-medium text-growth-green mt-2">5 launch sequences</p>
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
                <p className="text-xs text-gray-600 mt-1">Build trust & drive repeat purchases</p>
                <p className="text-sm font-medium text-trust-blue mt-2">3 conversion templates</p>
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
                <p className="text-xs text-gray-600 mt-1">Convert subscribers to buyers</p>
                <p className="text-sm font-medium text-growth-green mt-2">3 onboarding flows</p>
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
                <p className="text-xs text-gray-600 mt-1">Time-sensitive revenue drivers</p>
                <p className="text-sm font-medium text-alert-amber mt-2">4 urgency templates</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Templates by Growth Stage */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-zebra-black mb-4">Templates by Growth Stage</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Starting Out */}
              <Card className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden hover:border-growth-green/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-zebra-black">Starting Out</CardTitle>
                    <ZebCharacter variant="guide" size="sm" className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-gray-600">$0-100K/month</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-growth-green" />
                      <span className="text-sm">Welcome Series</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-growth-green" />
                      <span className="text-sm">First Purchase</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-growth-green" />
                      <span className="text-sm">Basic Cart Recovery</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-4 bg-growth-green hover:bg-growth-green-600 text-white"
                  >
                    View Starter Templates
                  </Button>
                </CardContent>
              </Card>

              {/* Scaling Up */}
              <Card className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden hover:border-success-purple/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-zebra-black">Scaling Up</CardTitle>
                    <ZebCharacter variant="thinking" size="sm" className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-gray-600">$100K-1M/month</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-success-purple" />
                        <div className="w-2 h-2 rounded-full bg-success-purple" />
                      </div>
                      <span className="text-sm">Advanced Segmentation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-success-purple" />
                        <div className="w-2 h-2 rounded-full bg-success-purple" />
                      </div>
                      <span className="text-sm">Win-Back Campaigns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-success-purple" />
                        <div className="w-2 h-2 rounded-full bg-success-purple" />
                      </div>
                      <span className="text-sm">VIP Programs</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-4 bg-success-purple hover:bg-success-purple/90 text-white"
                  >
                    View Growth Templates
                  </Button>
                </CardContent>
              </Card>

              {/* Market Leader */}
              <Card className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden hover:border-alert-amber/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-zebra-black">Market Leader</CardTitle>
                    <ZebCharacter variant="celebrate" size="sm" className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-gray-600">$1M+/month</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-alert-amber" />
                        <div className="w-2 h-2 rounded-full bg-alert-amber" />
                        <div className="w-2 h-2 rounded-full bg-alert-amber" />
                      </div>
                      <span className="text-sm">Multi-channel Orchestration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-alert-amber" />
                        <div className="w-2 h-2 rounded-full bg-alert-amber" />
                        <div className="w-2 h-2 rounded-full bg-alert-amber" />
                      </div>
                      <span className="text-sm">Predictive Campaigns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-alert-amber" />
                        <div className="w-2 h-2 rounded-full bg-alert-amber" />
                        <div className="w-2 h-2 rounded-full bg-alert-amber" />
                      </div>
                      <span className="text-sm">Global Expansion</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-4 bg-alert-amber hover:bg-alert-amber/90 text-zebra-black"
                  >
                    View Enterprise Templates
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Templates grid */}
      <TemplateGrid 
        showUserTemplates={viewMode === 'my-templates'}
      />
    </div>
  );
}