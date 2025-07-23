'use client';

import React from 'react';
import { 
  useTemplates, 
  useSelectedTemplate, 
  useTemplateFilters, 
  useTemplateActions,
  default as useTemplateStore 
} from '@/hooks/use-template-store';
import { 
  useTemplateSync, 
  useOptimisticTemplate, 
  useCreateTemplate,
  useDeleteTemplate,
  useTemplateSearch 
} from '@/hooks/use-template-sync';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Save, 
  Trash2, 
  RefreshCw, 
  Filter,
  Database,
  Zap
} from 'lucide-react';

/**
 * Main demo component showing template store usage
 */
export function TemplateStoreDemo() {
  const templates = useTemplates();
  const selectedTemplate = useSelectedTemplate();
  const filters = useTemplateFilters();
  const { updateFilters, setSelectedId, fetchTemplates } = useTemplateActions();
  const { refreshTemplates } = useTemplateSync();
  const loading = useTemplateStore(state => state.loading);
  const error = useTemplateStore(state => state.error);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Template Store Demo</h2>
      
      {/* Store Status */}
      <StoreStatus />
      
      {/* Filters */}
      <TemplateFilters />
      
      {/* Template List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Templates</h3>
          
          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p>Loading templates...</p>
            </div>
          )}
          
          {error && (
            <Card className="p-4 bg-red-50 border-red-200">
              <p className="text-red-600">{error}</p>
              <Button 
                onClick={() => fetchTemplates(true)} 
                size="sm" 
                className="mt-2"
              >
                Retry
              </Button>
            </Card>
          )}
          
          <div className="space-y-2">
            {templates.map(template => (
              <TemplateListItem
                key={template.id}
                template={template}
                isSelected={selectedTemplate?.id === template.id}
                onSelect={() => setSelectedId(template.id)}
              />
            ))}
          </div>
          
          {templates.length === 0 && !loading && (
            <p className="text-gray-500 text-center py-8">
              No templates found
            </p>
          )}
        </div>
        
        {/* Selected Template Editor */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Selected Template</h3>
          {selectedTemplate ? (
            <TemplateEditor templateId={selectedTemplate.id} />
          ) : (
            <Card className="p-8 text-center text-gray-500">
              Select a template to edit
            </Card>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2">
        <CreateTemplateButton />
        <Button onClick={refreshTemplates} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All
        </Button>
      </div>
    </div>
  );
}

/**
 * Store status display
 */
function StoreStatus() {
  const templateCount = useTemplateStore(state => state.templates.size);
  const hasUnsavedChanges = useTemplateStore(state => state.hasUnsavedChanges());
  const lastFetch = useTemplateStore(state => state.lastFetch);
  
  return (
    <Card className="p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="text-sm">
              {templateCount} templates loaded
            </span>
          </div>
          
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-yellow-600">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
        </div>
        
        {lastFetch > 0 && (
          <span className="text-xs text-gray-500">
            Last updated: {new Date(lastFetch).toLocaleTimeString()}
          </span>
        )}
      </div>
    </Card>
  );
}

/**
 * Template filters component
 */
function TemplateFilters() {
  const filters = useTemplateFilters();
  const { updateFilters } = useTemplateActions();
  const { searchQuery, setSearchQuery } = useTemplateSearch();
  
  return (
    <Card className="p-4">
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => updateFilters({ category: e.target.value as any })}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Categories</option>
          <option value="abandoned-cart">Abandoned Cart</option>
          <option value="welcome">Welcome</option>
          <option value="promotional">Promotional</option>
        </select>
        
        {/* Sort By */}
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
          className="px-3 py-2 border rounded-md"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
          <option value="revenue">Highest Revenue</option>
          <option value="conversion">Best Conversion</option>
        </select>
        
        {/* Toggle User Templates */}
        <Button
          variant={filters.showUserTemplates ? "default" : "outline"}
          onClick={() => updateFilters({ showUserTemplates: !filters.showUserTemplates })}
        >
          <Filter className="w-4 h-4 mr-2" />
          {filters.showUserTemplates ? 'My Templates' : 'Public Templates'}
        </Button>
      </div>
    </Card>
  );
}

/**
 * Template list item
 */
function TemplateListItem({ 
  template, 
  isSelected, 
  onSelect 
}: { 
  template: any; 
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { deleteTemplate } = useDeleteTemplate();
  
  return (
    <Card 
      className={`p-3 cursor-pointer transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium flex items-center gap-2">
            {template.name}
            {template.localChanges && (
              <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">
                Modified
              </span>
            )}
          </h4>
          <p className="text-sm text-gray-600">{template.category}</p>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            deleteTemplate(template.id, template.name);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

/**
 * Template editor component
 */
function TemplateEditor({ templateId }: { templateId: string }) {
  const { template, updateField, hasChanges } = useOptimisticTemplate(templateId);
  const { saveTemplate } = useTemplateActions();
  const [saving, setSaving] = React.useState(false);
  
  if (!template) return null;
  
  const handleSave = async () => {
    setSaving(true);
    try {
      await saveTemplate(templateId);
      alert('Template saved successfully!');
    } catch (error) {
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Card className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          value={template.name}
          onChange={(e) => updateField('name', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={template.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={template.category}
          onChange={(e) => updateField('category', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="abandoned-cart">Abandoned Cart</option>
          <option value="welcome">Welcome</option>
          <option value="promotional">Promotional</option>
        </select>
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || saving}
          className="flex-1"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
        </Button>
      </div>
      
      {template.lastSynced && (
        <p className="text-xs text-gray-500">
          Last synced: {new Date(template.lastSynced).toLocaleString()}
        </p>
      )}
    </Card>
  );
}

/**
 * Create template button
 */
function CreateTemplateButton() {
  const { create } = useCreateTemplate();
  const [creating, setCreating] = React.useState(false);
  
  const handleCreate = async () => {
    setCreating(true);
    try {
      const newId = await create({
        name: 'New Template',
        description: 'A new email template',
        category: 'welcome',
        is_public: false,
      });
      
      alert(`Template created with ID: ${newId}`);
    } catch (error) {
      alert('Failed to create template');
    } finally {
      setCreating(false);
    }
  };
  
  return (
    <Button onClick={handleCreate} disabled={creating}>
      <Plus className="w-4 h-4 mr-2" />
      {creating ? 'Creating...' : 'New Template'}
    </Button>
  );
}