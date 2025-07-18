'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Share2,
  Clock,
  Info,
  Edit,
  Plus
} from 'lucide-react';
import { mergeTags, getAllMergeTags } from '@/lib/merge-tags';
import { createMergeTag } from '@/lib/merge-tags/parser';

interface EnhancedMergeTagsPanelProps {
  onTagSelect?: (tag: string) => void;
  onTagsUsedUpdate?: (tagPaths: string[]) => void;
  usedTags?: string[];
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

// Track recently used tags in localStorage
const RECENT_TAGS_KEY = 'merge-tags-recent';
const MAX_RECENT_TAGS = 10;

export function EnhancedMergeTagsPanel({ 
  onTagSelect, 
  onTagsUsedUpdate,
  usedTags = [],
  compact = false 
}: EnhancedMergeTagsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Customer': true,
    'Order': true,
    'Product': true
  });
  const [recentTags, setRecentTags] = useState<string[]>([]);
  const [showFallbackModal, setShowFallbackModal] = useState<{ tag: any; show: boolean } | null>(null);
  const [fallbackValue, setFallbackValue] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Load recent tags from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_TAGS_KEY);
    if (stored) {
      try {
        setRecentTags(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading recent tags:', e);
      }
    }
  }, []);

  // Update recent tags when a tag is used
  const updateRecentTags = (tagValue: string) => {
    const updated = [tagValue, ...recentTags.filter(t => t !== tagValue)].slice(0, MAX_RECENT_TAGS);
    setRecentTags(updated);
    localStorage.setItem(RECENT_TAGS_KEY, JSON.stringify(updated));
  };

  const handleCopyTag = (tagValue: string, withFallback = false) => {
    const finalTag = withFallback && fallbackValue 
      ? createMergeTag(tagValue.replace(/[{}]/g, ''), fallbackValue)
      : tagValue;
      
    navigator.clipboard.writeText(finalTag);
    setCopiedTag(finalTag);
    setTimeout(() => setCopiedTag(null), 2000);
    
    updateRecentTags(tagValue);
    onTagSelect?.(finalTag);
    
    // Reset fallback modal
    setShowFallbackModal(null);
    setFallbackValue('');
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Get filtered tags based on search
  const filteredTags = useMemo(() => {
    if (!searchQuery) return null;
    
    return getAllMergeTags().filter(tag => 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Get recent tags data
  const recentTagsData = useMemo(() => {
    return recentTags
      .map(tagValue => getAllMergeTags().find(t => t.value === tagValue))
      .filter(Boolean);
  }, [recentTags]);

  // Tag item component
  const TagItem = ({ tag, showCategory = false }: { tag: any; showCategory?: boolean }) => {
    const isUsed = usedTags.includes(tag.value);
    
    return (
      <div
        className={`flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer border ${
          isUsed ? 'border-blue-200 bg-blue-50' : 'border-transparent'
        }`}
        onClick={() => handleCopyTag(tag.value)}
      >
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{tag.name}</span>
            {showCategory && (
              <Badge variant="outline" className="text-xs">
                {tag.category}
              </Badge>
            )}
            {isUsed && (
              <Badge variant="secondary" className="text-xs">
                Used
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <code className="text-xs text-gray-600">{tag.value}</code>
            <span className="text-xs text-gray-400">→</span>
            <span className="text-xs text-gray-500">{tag.sample}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setShowFallbackModal({ tag, show: true });
              setFallbackValue('');
            }}
            title="Add fallback value"
          >
            <Plus className="w-3 h-3" />
          </Button>
          {copiedTag === tag.value ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
    );
  };

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
              <TagItem key={index} tag={tag} showCategory={!!searchQuery} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Enhanced Merge Tags</span>
            <Badge variant="outline">{usedTags.length} used</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Click to copy, use + to add fallback values
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

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Tags</TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="used" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Used
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="h-96 overflow-y-auto">
                <div className="space-y-3">
                  {searchQuery ? (
                    // Show filtered results
                    <div className="space-y-2">
                      {filteredTags?.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No tags found</p>
                      ) : (
                        filteredTags?.map((tag, index) => (
                          <TagItem key={index} tag={tag} showCategory />
                        ))
                      )}
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
                                <div key={tagKey} className="border-b last:border-b-0">
                                  <TagItem tag={tag} />
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
            </TabsContent>

            <TabsContent value="recent" className="mt-4">
              <div className="h-96 overflow-y-auto">
                {recentTagsData.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No recently used tags
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recentTagsData.map((tag, index) => (
                      <TagItem key={index} tag={tag} showCategory />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="used" className="mt-4">
              <div className="h-96 overflow-y-auto">
                {usedTags.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No tags used in this template yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getAllMergeTags()
                      .filter(tag => usedTags.includes(tag.value))
                      .map((tag, index) => (
                        <TagItem key={index} tag={tag} showCategory />
                      ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center space-x-2 text-xs text-gray-500 pt-2 border-t">
            <Info className="w-3 h-3" />
            <p>Pro tip: Add fallback values with the + button for better personalization</p>
          </div>
        </CardContent>
      </Card>

      {/* Fallback Value Modal */}
      {showFallbackModal?.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="text-lg">Add Fallback Value</CardTitle>
              <p className="text-sm text-gray-600">
                For: <code>{showFallbackModal.tag.value}</code>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Fallback Value</label>
                <Input
                  placeholder="e.g., Valued Customer"
                  value={fallbackValue}
                  onChange={(e) => setFallbackValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && fallbackValue) {
                      handleCopyTag(showFallbackModal.tag.value, true);
                    }
                  }}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  This value will be used if the data is missing
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFallbackModal(null);
                    setFallbackValue('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleCopyTag(showFallbackModal.tag.value, true)}
                  disabled={!fallbackValue}
                >
                  Copy with Fallback
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}