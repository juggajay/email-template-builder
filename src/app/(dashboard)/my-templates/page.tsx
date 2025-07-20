'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Download, 
  FolderOpen,
  Grid3X3,
  List,
  Search,
  Filter,
  Calendar,
  FileText,
  Package,
  Archive,
  Trash2,
  Edit,
  Eye,
  Copy,
  MoreVertical,
  FileJson,
  Code,
  Mail,
  TrendingUp,
  BarChart,
  Send
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { getTemplatePreview } from '@/lib/template-previews';
import { ZebCharacter, StripePattern } from '@/components/brand';
import { 
  DollarSignIcon,
  ChartIcon,
  TargetIcon
} from '@/components/brand/GeometricIcons';
import {
  GeometricLightningIcon,
  GeometricTrophyIcon,
  GeometricBeakerIcon,
  GeometricGearIcon,
  GeometricPlayIcon,
  GeometricPauseIcon
} from '@/components/brand/MetricIcons';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function MyTemplatesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserTemplates();
    }
  }, [user]);

  const fetchUserTemplates = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_templates')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (template: any, format: 'html' | 'json') => {
    try {
      const supabase = createClient();
      
      // Record the export
      await supabase
        .from('template_exports')
        .insert({
          user_id: user?.id,
          template_id: template.id,
          export_type: format,
        });

      if (format === 'html') {
        // Export as HTML
        const blob = new Blob([template.html_content || ''], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}.html`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Export as JSON (design)
        const blob = new Blob([JSON.stringify(template.json_design, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting template:', error);
      alert('Failed to export template');
    }
  };

  const handleBulkLaunch = async () => {
    if (selectedTemplates.length === 0) {
      alert('Please select templates to launch');
      return;
    }

    try {
      // In a real implementation, this would launch campaigns
      const templatesToLaunch = templates.filter(t => selectedTemplates.includes(t.id));
      
      // Show success message
      alert(`Launching ${templatesToLaunch.length} campaigns. Projected revenue impact: $${(templatesToLaunch.length * 2100).toLocaleString()}/month`);
      
      // Clear selection
      setSelectedTemplates([]);
    } catch (error) {
      console.error('Error launching campaigns:', error);
    }
  };

  const handleDuplicate = async (template: any) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_templates')
        .insert({
          user_id: user?.id,
          name: `${template.name} (Copy)`,
          json_design: template.json_design,
          html_content: template.html_content,
          template_id: template.template_id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh templates
      fetchUserTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Failed to duplicate template');
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== templateId));
      setSelectedTemplates(selectedTemplates.filter(id => id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const stats = {
    total: templates.length,
    recent: templates.filter(t => {
      const created = new Date(t.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    }).length,
    exported: templates.reduce((sum, t) => sum + (t.export_count || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zebra-black">My Templates</h1>
            <p className="text-gray-700 mt-2 font-medium">
              Your revenue engines - track, optimize, and scale
            </p>
            {templates.length > 0 && (
              <p className="text-sm text-growth-green mt-1">
                Generated $47,892 last month
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedTemplates.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-systematic-grey to-white border-t-2 border-growth-green rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  {selectedTemplates.length} selected
                </span>
                <Button 
                  size="sm"
                  onClick={handleBulkLaunch}
                  className="bg-growth-green hover:bg-growth-green-600 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Launch Campaign
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => handleDuplicate(templates.find(t => selectedTemplates.includes(t.id)))}
                >
                  <GeometricBeakerIcon className="w-4 h-4 mr-2" />
                  A/B Test Selected
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  className="text-alert-amber hover:bg-alert-amber/10"
                >
                  Archive Low Performers
                </Button>
              </div>
            )}
            <Link href="/editor">
              <Button className="bg-growth-green hover:bg-growth-green-600 text-white">
                <TargetIcon className="w-4 h-4 mr-2" />
                Build Template
              </Button>
            </Link>
            <ZebCharacter variant="guide" size="sm" className="hidden lg:block" />
          </div>
        </div>
        
        {/* Geometric pattern divider */}
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-growth-green/20 to-transparent" />
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-growth-green/20 group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <StripePattern animation="static" opacity={0.03} color="#00d4aa" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-700">Active Campaigns</CardTitle>
            <div className="p-2 rounded-lg bg-growth-green/10 text-growth-green">
              <GeometricLightningIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-zebra-black">
              {templates.filter(t => t.status === 'active').length || 0}
            </div>
            <p className="text-xs text-gray-600">
              Currently driving revenue
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-success-purple/20 group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <StripePattern animation="static" opacity={0.03} color="#6b5fd4" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-700">Revenue This Month</CardTitle>
            <div className="p-2 rounded-lg bg-success-purple/10 text-success-purple">
              <DollarSignIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-success-purple">
              ${templates.length > 0 ? '12,847' : '0'}
            </div>
            <p className="text-xs text-gray-600">
              From your templates
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-growth-green/20 group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <StripePattern animation="static" opacity={0.03} color="#00d4aa" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-700">Avg. Conversion</CardTitle>
            <div className="p-2 rounded-lg bg-growth-green/10 text-growth-green">
              <ChartIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-zebra-black">
              {templates.length > 0 ? '3.2%' : '0%'}
            </div>
            <p className="text-xs text-gray-600">
              Across all templates
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-alert-amber/20 group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <StripePattern animation="static" opacity={0.03} color="#ffb800" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-700">Best Performer</CardTitle>
            <div className="p-2 rounded-lg bg-alert-amber/10 text-alert-amber">
              <GeometricTrophyIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-xl font-bold text-zebra-black truncate">
              {templates.length > 0 ? templates[0]?.name : 'None yet'}
            </div>
            <p className="text-xs text-gray-600">
              {templates.length > 0 ? 'Create more to compete' : 'Create your first template'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, performance, or revenue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Quick filters */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              High Performers
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Need Optimization
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Recently Active
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Templates */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <ZebCharacter 
              variant="loading" 
              size="lg" 
              className="mx-auto mb-4"
            />
            <p className="text-gray-700 font-medium">Finding your revenue drivers...</p>
            <div className="mt-4 w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-growth-green rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card className="p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <StripePattern animation="static" opacity={0.05} color="#00d4aa" />
          </div>
          <div className="text-center relative z-10">
            <ZebCharacter 
              variant="guide" 
              size="lg" 
              className="mx-auto mb-6"
            />
            <h2 className="text-2xl font-bold text-zebra-black mb-3">
              {searchQuery 
                ? 'No templates found for your search' 
                : 'Ready to create your first revenue driver?'}
            </h2>
            <p className="text-gray-700 mb-8 max-w-lg mx-auto">
              {searchQuery 
                ? 'Try adjusting your filters or browse all templates' 
                : 'Join 2,847 merchants who\'ve grown their revenue with custom templates'}
            </p>
            
            {!searchQuery && (
              <div className="grid grid-cols-2 gap-8 max-w-sm mx-auto mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-growth-green">$2,100</div>
                  <div className="text-xs text-gray-600">Avg. monthly revenue per template</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-growth-green">3.4%</div>
                  <div className="text-xs text-gray-600">Avg. conversion rate</div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/editor">
                <Button 
                  size="lg"
                  className="bg-growth-green hover:bg-growth-green-600 text-white"
                >
                  <TargetIcon className="w-4 h-4 mr-2" />
                  Build Your First Template
                </Button>
              </Link>
              <Link href="/templates">
                <Button size="lg" variant="outline">
                  Start from Proven Template
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-lg transition-all relative overflow-hidden hover:border-growth-green/30">
              {/* Performance badge */}
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-success-purple text-white border-0">
                  Top Performer
                </Badge>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-20">
                    <h3 className="font-bold text-zebra-black line-clamp-1">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-600">
                        {new Date(template.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-1">
                        <GeometricPlayIcon className="w-3 h-3 text-growth-green" />
                        <span className="text-xs font-medium text-growth-green">Active</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(template.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTemplates([...selectedTemplates, template.id]);
                        } else {
                          setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                        }
                      }}
                      className="h-4 w-4 text-growth-green rounded border-gray-300"
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Preview */}
                <div 
                  className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer"
                  onClick={() => window.location.href = `/editor?template=${template.id}`}
                >
                  <div 
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ 
                      __html: `
                        <div style="transform: scale(0.3); transform-origin: top left; width: 333.33%; height: 333.33%; position: absolute; top: 0; left: 0;">
                          ${template.html_content || '<p>No preview available</p>'}
                        </div>
                      ` 
                    }}
                  />
                </div>

                {/* Performance metrics */}
                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Revenue</span>
                    <span className="font-bold text-growth-green">$4,230/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Conversion</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">3.2%</span>
                      <TrendingUp className="w-3 h-3 text-growth-green" />
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => window.location.href = `/editor?template=${template.id}`}
                      className="bg-growth-green hover:bg-growth-green-600 text-white"
                    >
                      <TargetIcon className="w-4 h-4 mr-1" />
                      Optimize
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const win = window.open('', '_blank');
                        if (win) {
                          win.document.write(template.html_content || '');
                          win.document.close();
                        }
                      }}
                    >
                      <BarChart className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="relative">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-10 hidden group-hover:block border border-gray-100">
                      <div className="py-1">
                        <button
                          onClick={() => window.location.href = `/editor?template=${template.id}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-growth-green/10 hover:text-growth-green w-full text-left"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Launch Campaign
                        </button>
                        <button
                          onClick={() => handleDuplicate(template)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-growth-green/10 hover:text-growth-green w-full text-left"
                        >
                          <GeometricBeakerIcon className="w-4 h-4 mr-2" />
                          Duplicate & Test
                        </button>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-growth-green/10 hover:text-growth-green w-full text-left"
                        >
                          <BarChart className="w-4 h-4 mr-2" />
                          View Analytics
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => handleExport(template, 'html')}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export HTML
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Archive Template
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.length === filteredTemplates.length && filteredTemplates.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTemplates(filteredTemplates.map(t => t.id));
                        } else {
                          setSelectedTemplates([]);
                        }
                      }}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left p-4 font-medium text-gray-900">Template Name</th>
                  <th className="text-left p-4 font-medium text-gray-900">Revenue Generated</th>
                  <th className="text-left p-4 font-medium text-gray-900">Conversion Rate</th>
                  <th className="text-left p-4 font-medium text-gray-900">Last Sent</th>
                  <th className="text-left p-4 font-medium text-gray-900">Status</th>
                  <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedTemplates.includes(template.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTemplates([...selectedTemplates, template.id]);
                          } else {
                            setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                          }
                        }}
                        className="h-4 w-4 text-primary-600 rounded border-gray-300"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-bold text-zebra-black">{template.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-growth-green">$2,847</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">3.2%</span>
                        <TrendingUp className="w-3 h-3 text-growth-green" />
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(template.last_modified || template.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <GeometricPlayIcon className="w-3 h-3 text-growth-green" />
                        <span className="text-sm font-medium text-growth-green">Active</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.location.href = `/editor?template=${template.id}`}
                          className="hover:text-growth-green"
                        >
                          <TargetIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:text-growth-green"
                        >
                          <BarChart className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicate(template)}
                          className="hover:text-growth-green"
                        >
                          <GeometricBeakerIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:text-growth-green"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}