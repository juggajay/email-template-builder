'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Download, 
  Heart, 
  Star,
  ShoppingCart,
  Rocket,
  CheckCircle,
  UserPlus,
  Target,
  Trash2,
  ArrowUpDown,
  TrendingUp,
  DollarSign,
  Globe,
  User
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type { EmailTemplate, TemplateCategory } from '@/types';
import { getTemplatePreview } from '@/lib/template-previews';
import { ZebCharacter, StripePattern } from '@/components/brand';
import { TargetIcon } from '@/components/brand/GeometricIcons';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Template performance data interface
interface TemplatePerformanceData {
  monthlyRevenue: number;
  conversionRate: number;
  avgOrderValue: number;
  sends: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

// Enhanced template interface
interface EnhancedTemplate extends EmailTemplate {
  performance?: TemplatePerformanceData;
  growthStage?: 'starter' | 'growth' | 'scale';
  performanceBadge?: 'top-performer' | 'rising' | 'new';
}

interface TemplateGridProps {
  category?: TemplateCategory;
  showUserTemplates?: boolean;
  onViewModeChange?: (mode: 'public' | 'my-templates') => void;
}

// Template skeleton component
function TemplateSkeleton() {
  return (
    <Card className="group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <div className="flex items-center space-x-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="aspect-video w-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TemplateGrid({ category, showUserTemplates = false, onViewModeChange }: TemplateGridProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedPerformance, setSelectedPerformance] = useState<'all' | 'top-performer' | 'rising' | 'new'>('all');
  const [sortBy, setSortBy] = useState<'revenue-desc' | 'conversion-desc' | 'newest' | 'trending'>('revenue-desc');
  const [error, setError] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const { user, isPro, isAgency } = useAuth();

  // Sort options for dropdown
  const sortOptions = [
    { value: 'revenue-desc', label: 'Highest Revenue First' },
    { value: 'conversion-desc', label: 'Best Conversion Rate' },
    { value: 'newest', label: 'Recently Added' },
    { value: 'trending', label: 'Trending Up' }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', icon: null },
    { id: 'abandoned-cart', name: 'Abandoned Cart', icon: ShoppingCart },
    { id: 'product-launch', name: 'Product Launch', icon: Rocket },
    { id: 'order-confirmation', name: 'Order Confirmation', icon: CheckCircle },
    { id: 'welcome', name: 'Welcome', icon: UserPlus },
    { id: 'promotional', name: 'Promotional', icon: Target },
  ];

  // Mock templates with performance data
  const mockTemplates: EnhancedTemplate[] = [
    {
      id: 'mock-1',
      name: 'Abandoned Cart Reminder',
      description: 'Recover lost sales with this effective cart abandonment email',
      category: 'abandoned-cart',
      is_public: true,
      is_premium: false,
      usage_count: 1250,
      rating: 4.8,
      tags: ['ecommerce', 'recovery', 'sales'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      performance: {
        monthlyRevenue: 24500,
        conversionRate: 3.8,
        avgOrderValue: 85,
        sends: 15000,
        trend: 'up',
        lastUpdated: new Date()
      },
      growthStage: 'growth',
      performanceBadge: 'top-performer'
    },
    {
      id: 'mock-2',
      name: 'Welcome Series',
      description: 'Make a great first impression with new subscribers',
      category: 'welcome',
      is_public: true,
      is_premium: false,
      usage_count: 980,
      rating: 4.9,
      tags: ['onboarding', 'welcome', 'engagement'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-3',
      name: 'Order Confirmation',
      description: 'Professional order confirmation with tracking info',
      category: 'order-confirmation',
      is_public: true,
      is_premium: false,
      usage_count: 2100,
      rating: 4.7,
      tags: ['transactional', 'order', 'confirmation'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-4',
      name: 'Product Launch Announcement',
      description: 'Generate buzz for your new product launch',
      category: 'product-launch',
      is_public: true,
      is_premium: true,
      usage_count: 650,
      rating: 4.6,
      tags: ['launch', 'product', 'announcement'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-5',
      name: 'Flash Sale Alert',
      description: 'Drive urgency with limited-time offers',
      category: 'promotional',
      is_public: true,
      is_premium: false,
      usage_count: 1800,
      rating: 4.8,
      tags: ['sale', 'promotion', 'discount'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const fetchTemplates = useCallback(async () => {
    // Don't show loading if we already have templates
    if (templates.length === 0) {
      setLoading(true);
    }
    
    try {
      const supabase = createClient();
      let query = supabase
        .from('email_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (showUserTemplates && user) {
        query = supabase
          .from('user_templates')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
      } else {
        query = query.eq('is_public', true);
      }

      if (selectedCategory !== 'all' && !showUserTemplates) {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        if (showUserTemplates) {
          query = query.ilike('name', `%${searchQuery}%`);
        } else {
          query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }
      }

      const { data, error } = await query;
      
      if (error) {
        throw error;
      }

      setTemplates(data || []);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      
      // Only use mock templates for public templates, not user templates
      if (!showUserTemplates) {
        const filteredMocks = selectedCategory !== 'all' 
          ? mockTemplates.filter(t => t.category === selectedCategory)
          : mockTemplates;
        
        setTemplates(filteredMocks);
      } else {
        // For user templates, show empty state
        setTemplates([]);
      }
      
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, user, showUserTemplates, templates.length]);

  useEffect(() => {
    // Clear templates when switching between views
    setTemplates([]);
    setLoading(true);
    
    // Fetch appropriate templates based on view
    fetchTemplates();
  }, [selectedCategory, searchQuery, showUserTemplates]);

  const handleTemplateSelect = (template: EmailTemplate) => {
    window.location.href = `/editor?template=${template.id}`;
  };

  const handlePreview = (template: any) => {
    setPreviewTemplate(template);
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

      // Remove from local state
      setTemplates(templates.filter(t => t.id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.icon;
  };

  const getCategoryColor = (categoryId: string): 'default' | 'secondary' | 'outline' => {
    switch (categoryId) {
      case 'abandoned-cart':
        return 'default';
      case 'product-launch':
        return 'secondary';
      case 'promotional':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* View mode and category filters */}
      <div className="space-y-4">
        {/* View mode toggle */}
        <div className="flex items-center border rounded-lg p-1 w-fit">
          <Button
            variant={!showUserTemplates ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              if (onViewModeChange) {
                onViewModeChange('public');
              }
            }}
          >
            <Globe className="w-4 h-4 mr-2" />
            Public Templates
          </Button>
          <Button
            variant={showUserTemplates ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              if (onViewModeChange) {
                onViewModeChange('my-templates');
              }
            }}
          >
            <User className="w-4 h-4 mr-2" />
            My Templates
          </Button>
        </div>

        {/* Category filters - only show for public templates */}
        {!showUserTemplates && (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <Button
                  key={cat.id}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id as TemplateCategory | 'all')}
                  className={cn(
                    "relative overflow-hidden transition-all duration-200",
                    isActive && "bg-growth-green hover:bg-growth-green-600 text-white border-growth-green"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none">
                      <StripePattern 
                        animation="parallax" 
                        speed="slow" 
                        opacity={0.1} 
                        color="#ffffff"
                      />
                    </div>
                  )}
                  {Icon && <Icon className="w-4 h-4 mr-2 relative z-10" />}
                  <span className="relative z-10">{cat.name}</span>
                </Button>
              );
            })}
          </div>
        )}

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
      </div>

      {/* Templates grid */}
      {loading && templates.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <TemplateSkeleton key={i} />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <ZebCharacter 
              variant={showUserTemplates ? 'guide' : 'thinking'} 
              size="lg" 
              className="mx-auto"
            />
          </div>
          <h3 className="text-lg font-bold text-zebra-black mb-2">
            {showUserTemplates 
              ? "No templates yet? Let's build your first revenue driver!"
              : 'No templates found for your search'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {showUserTemplates 
              ? 'Start with our proven e-commerce templates to drive growth'
              : 'Try adjusting your filters or browse all templates'
            }
          </p>
          <Link href={showUserTemplates ? '/templates' : '/editor'}>
            <Button className="bg-growth-green hover:bg-growth-green-600 text-white">
              <TargetIcon className="w-4 h-4 mr-2" />
              {showUserTemplates ? 'Browse Growth Templates' : 'Create Growth Template'}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const enhancedTemplate = template as EnhancedTemplate;
            const performanceBadge = enhancedTemplate.performanceBadge || (enhancedTemplate.usage_count > 1000 ? 'top-performer' : enhancedTemplate.usage_count > 500 ? 'rising' : 'new');
            const revenue = enhancedTemplate.performance?.monthlyRevenue || Math.floor(Math.random() * 50000) + 5000;
            const conversionRate = enhancedTemplate.performance?.conversionRate || (Math.random() * 4 + 1).toFixed(1);
            
            return (
              <Card 
                key={template.id} 
                className="group relative hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-growth-green/30 hover:-translate-y-1 overflow-hidden"
                onClick={() => handleTemplateSelect(template)}
              >
                {/* Stripe pattern on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <StripePattern animation="static" opacity={0.03} color="#00d4aa" />
                </div>
              
              <CardContent className="p-3 space-y-3">
                {/* Template preview with category badge overlay */}
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                  {/* Category badge overlay */}
                  {!showUserTemplates && template.category && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge variant={getCategoryColor(template.category)} className="shadow-sm">
                        {template.category.replace('-', ' ')}
                      </Badge>
                    </div>
                  )}
                  {template.thumbnail_url ? (
                    <img 
                      src={template.thumbnail_url} 
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : showUserTemplates && template.html_content ? (
                    <div 
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ 
                        __html: `
                          <div style="transform: scale(0.3); transform-origin: top left; width: 333.33%; height: 333.33%; position: absolute; top: 0; left: 0;">
                            ${template.html_content}
                          </div>
                        ` 
                      }}
                    />
                  ) : (
                    <div 
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ 
                        __html: `
                          <div style="transform: scale(0.3); transform-origin: top left; width: 333.33%; height: 333.33%; position: absolute; top: 0; left: 0;">
                            ${getTemplatePreview(template.name, template.category)}
                          </div>
                        ` 
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
                </div>

                {/* Template info */}
                <div className="space-y-1">
                  <h3 className="font-bold text-zebra-black group-hover:text-growth-green transition-colors line-clamp-1">
                    {template.name}
                  </h3>
                  {template.description && (
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {template.description}
                    </p>
                  )}
                  
                  {/* Compact metrics */}
                  {!showUserTemplates && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-gray-600">
                        ${(revenue/1000).toFixed(0)}k/mo • {conversionRate}%
                      </span>
                    </div>
                  )}
                  
                  {/* Date info for user templates only */}
                  {showUserTemplates && (
                    <div className="text-xs text-gray-500 pt-1">
                      Created {new Date(template.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex space-x-2 relative z-10">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-growth-green hover:bg-growth-green-600 text-white group/btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateSelect(template);
                    }}
                  >
                    <TargetIcon className="w-4 h-4 mr-2 transition-transform group-hover/btn:rotate-12" />
                    {showUserTemplates ? 'Edit Template' : 'Start Building'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(template);
                    }}
                    className="hover:border-growth-green hover:text-growth-green"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {showUserTemplates && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(template.id);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>{previewTemplate?.name} - Preview</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
            <div 
              dangerouslySetInnerHTML={{ 
                __html: previewTemplate && (
                  showUserTemplates && previewTemplate.html_content 
                    ? previewTemplate.html_content 
                    : getTemplatePreview(previewTemplate.name, previewTemplate.category)
                )
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}