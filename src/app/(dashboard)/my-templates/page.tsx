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
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { getTemplatePreview } from '@/lib/template-previews';

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

  const handleBulkExport = async () => {
    if (selectedTemplates.length === 0) {
      alert('Please select templates to export');
      return;
    }

    try {
      // Create a zip file with all selected templates
      const templatesToExport = templates.filter(t => selectedTemplates.includes(t.id));
      
      // For now, export them one by one
      // In a real implementation, you'd create a zip file
      for (const template of templatesToExport) {
        await handleExport(template, 'html');
      }
    } catch (error) {
      console.error('Error bulk exporting:', error);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Templates</h1>
          <p className="text-gray-600 mt-2">
            Manage and organize your custom email templates
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {selectedTemplates.length > 0 && (
            <Button variant="outline" onClick={handleBulkExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Selected ({selectedTemplates.length})
            </Button>
          )}
          <Link href="/editor">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Custom designs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent}</div>
            <p className="text-xs text-muted-foreground">
              Created this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exported</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.exported}</div>
            <p className="text-xs text-muted-foreground">
              Total exports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(templates.reduce((sum, t) => sum + JSON.stringify(t).length, 0) / 1024 / 1024).toFixed(1)} MB
            </div>
            <p className="text-xs text-muted-foreground">
              Used space
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
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading templates...</p>
          </div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No templates found' : 'No templates yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Create your first email template to get started'}
            </p>
            <Link href="/editor">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Template
              </Button>
            </Link>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 line-clamp-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(template.created_at).toLocaleDateString()}
                    </p>
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
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
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

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => window.location.href = `/editor?template=${template.id}`}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
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
                      <Eye className="w-4 h-4" />
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
                    
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                      <div className="py-1">
                        <button
                          onClick={() => handleExport(template, 'html')}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Code className="w-4 h-4 mr-2" />
                          Export as HTML
                        </button>
                        <button
                          onClick={() => handleExport(template, 'json')}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <FileJson className="w-4 h-4 mr-2" />
                          Export as JSON
                        </button>
                        <button
                          onClick={() => handleDuplicate(template)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
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
                  <th className="text-left p-4 font-medium text-gray-900">Name</th>
                  <th className="text-left p-4 font-medium text-gray-900">Created</th>
                  <th className="text-left p-4 font-medium text-gray-900">Modified</th>
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
                        <span className="font-medium">{template.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(template.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(template.last_modified || template.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.location.href = `/editor?template=${template.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleExport(template, 'html')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicate(template)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
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