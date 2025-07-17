'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';
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
  Target
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type { EmailTemplate, TemplateCategory } from '@/types';
import { getTemplatePreview } from '@/lib/template-previews';

interface TemplateGridProps {
  category?: TemplateCategory;
  showUserTemplates?: boolean;
}

export function TemplateGrid({ category, showUserTemplates = false }: TemplateGridProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const { user, isPro, isAgency } = useAuth();

  const categories = [
    { id: 'all', name: 'All Templates', icon: null },
    { id: 'abandoned-cart', name: 'Abandoned Cart', icon: ShoppingCart },
    { id: 'product-launch', name: 'Product Launch', icon: Rocket },
    { id: 'order-confirmation', name: 'Order Confirmation', icon: CheckCircle },
    { id: 'welcome', name: 'Welcome', icon: UserPlus },
    { id: 'promotional', name: 'Promotional', icon: Target },
  ];

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, searchQuery, user, showUserTemplates]);

  const fetchTemplates = async () => {
    try {
      console.log('Fetching templates...', { showUserTemplates, selectedCategory, searchQuery });
      
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
      
      console.log('Templates query result:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setTemplates(data || []);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      setError(error.message || 'Failed to load templates');
      
      // Use mock templates as fallback
      const mockTemplates: EmailTemplate[] = [
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
          updated_at: new Date().toISOString()
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
      
      // Filter mock templates based on category
      if (selectedCategory !== 'all') {
        setTemplates(mockTemplates.filter(t => t.category === selectedCategory));
      } else {
        setTemplates(mockTemplates);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    // Navigate to editor with template
    window.location.href = `/editor?template=${template.id}`;
  };

  const handlePreview = (template: EmailTemplate) => {
    // Use template preview HTML instead of raw HTML content
    const previewHtml = getTemplatePreview(template.name, template.category);
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${template.name} - Preview</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin: 0; padding: 0; background: #f5f5f5;">
          ${previewHtml}
        </body>
        </html>
      `);
      previewWindow.document.close();
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

  if (loading) {
    return <Loading size="lg" text="Loading templates..." />;
  }

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Unable to load templates from database
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Using demo templates. {error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {!showUserTemplates && (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id as TemplateCategory | 'all')}
                >
                  {Icon && <Icon className="w-4 h-4 mr-2" />}
                  {cat.name}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Templates grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {showUserTemplates ? (
              <Edit className="w-16 h-16 mx-auto" />
            ) : (
              <Search className="w-16 h-16 mx-auto" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showUserTemplates ? 'No templates yet' : 'No templates found'}
          </h3>
          <p className="text-gray-600">
            {showUserTemplates 
              ? 'Create your first template to get started'
              : 'Try adjusting your search or filters'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {!showUserTemplates && (
                      <Badge variant={getCategoryColor(template.category)}>
                        {template.category.replace('-', ' ')}
                      </Badge>
                    )}
                    {template.is_premium && (isPro || isAgency) && (
                      <Badge variant="secondary">
                        <Star className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(template);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to favorites
                      }}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Template preview */}
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group">
                  {template.thumbnail_url ? (
                    <img 
                      src={template.thumbnail_url} 
                      alt={template.name}
                      className="w-full h-full object-cover"
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
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {template.name}
                  </h3>
                  {template.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {template.usage_count || 0}
                      </div>
                      {template.rating > 0 && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                          {template.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    
                    {showUserTemplates && (
                      <span className="text-xs">
                        {new Date(template.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateSelect(template);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {showUserTemplates ? 'Edit' : 'Use Template'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(template);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}