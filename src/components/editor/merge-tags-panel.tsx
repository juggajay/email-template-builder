'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Copy, 
  CheckCircle, 
  ChevronRight,
  ChevronDown,
  User,
  Package,
  ShoppingCart,
  Store,
  Sparkles,
  Calendar,
  Share2
} from 'lucide-react';
import { mergeTags, getAllMergeTags } from '@/lib/merge-tags';

interface MergeTagsPanelProps {
  onTagSelect?: (tag: string) => void;
  compact?: boolean;
}

const categoryIcons: Record<string, any> = {
  'Customer': User,
  'Order': ShoppingCart,
  'Product': Package,
  'Store': Store,
  'Dynamic Content': Sparkles,
  'Date & Time': Calendar,
  'Social Media': Share2
};

export function MergeTagsPanel({ onTagSelect, compact = false }: MergeTagsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Customer': true,
    'Order': true,
    'Product': true
  });

  const handleCopyTag = (tagValue: string) => {
    navigator.clipboard.writeText(tagValue);
    setCopiedTag(tagValue);
    setTimeout(() => setCopiedTag(null), 2000);
    onTagSelect?.(tagValue);
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const filteredTags = searchQuery 
    ? getAllMergeTags().filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search merge tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-8 text-sm"
          />
        </div>
        
        <div className="h-48 overflow-y-auto">
          <div className="space-y-1">
            {(filteredTags || getAllMergeTags()).map((tag, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full justify-between text-xs"
                onClick={() => handleCopyTag(tag.value)}
              >
                <span className="truncate">{tag.name}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {tag.value}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Merge Tags</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Click to copy personalization tags for your email
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search merge tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="h-96 overflow-y-auto">
          <div className="space-y-3">
            {searchQuery ? (
              // Show filtered results
              <div className="space-y-2">
                {filteredTags?.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleCopyTag(tag.value)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{tag.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {tag.category}
                        </Badge>
                      </div>
                      <code className="text-xs text-gray-600">{tag.value}</code>
                    </div>
                    {copiedTag === tag.value ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Show categorized view
              Object.entries(mergeTags).map(([categoryKey, category]) => {
                const Icon = categoryIcons[category.name] || Package;
                const isExpanded = expandedCategories[category.name];
                
                return (
                  <div key={categoryKey} className="border rounded-lg">
                    <button
                      className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50"
                      onClick={() => toggleCategory(category.name)}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {Object.keys(category.mergeTags).length}
                        </Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="border-t">
                        {Object.entries(category.mergeTags).map(([tagKey, tag]) => (
                          <div
                            key={tagKey}
                            className="px-3 py-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => handleCopyTag(tag.value)}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm">{tag.name}</div>
                              <div className="flex items-center space-x-2 mt-1">
                                <code className="text-xs text-gray-600">{tag.value}</code>
                                <span className="text-xs text-gray-400">→</span>
                                <span className="text-xs text-gray-500">{tag.sample}</span>
                              </div>
                            </div>
                            {copiedTag === tag.value ? (
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {!searchQuery && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            <p>💡 Tip: Use merge tags to personalize your emails with customer data, order details, and dynamic content.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}