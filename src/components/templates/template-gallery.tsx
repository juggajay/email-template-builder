'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ECOMMERCE_TEMPLATES } from '@/data/templates';
import { useRouter } from 'next/navigation';

export function TemplateGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'abandoned-cart', name: 'Abandoned Cart' },
    { id: 'welcome', name: 'Welcome Series' },
    { id: 'order-confirmation', name: 'Order Confirmation' },
    { id: 'promotional', name: 'Promotional' }
  ];

  const filteredTemplates = Object.values(ECOMMERCE_TEMPLATES).filter(
    template => selectedCategory === 'all' || template.category === selectedCategory
  );

  const handleUseTemplate = (templateId: string) => {
    router.push(`/editor/new?template=${templateId}`);
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-100 relative">
              {/* Placeholder for template thumbnail */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Template Preview</p>
                </div>
              </div>
            </div>
            
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                {template.avgRecoveryRate && (
                  <Badge variant="secondary" className="text-xs">
                    {template.avgRecoveryRate} recovery
                  </Badge>
                )}
                {template.openRate && (
                  <Badge variant="secondary" className="text-xs">
                    {template.openRate} open rate
                  </Badge>
                )}
                {template.conversionRate && (
                  <Badge variant="secondary" className="text-xs">
                    {template.conversionRate} conversion
                  </Badge>
                )}
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => handleUseTemplate(template.id)}
              >
                Use This Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}