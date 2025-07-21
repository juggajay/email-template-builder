'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileUp, 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  User,
  ShoppingCart,
  Package,
  Store,
  Calendar,
  RefreshCw,
  Copy,
  CheckCircle
} from 'lucide-react';
import { getSampleData } from '@/lib/merge-tags';
import { replaceMergeTags } from '@/lib/merge-tags/parser';

interface PreviewDataEditorProps {
  onDataChange?: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
  templateContent?: string;
}

interface DataProfile {
  id: string;
  name: string;
  data: Record<string, any>;
  createdAt: string;
}

const STORAGE_KEY = 'merge-tags-preview-profiles';

export function PreviewDataEditor({ 
  onDataChange, 
  initialData,
  templateContent = ''
}: PreviewDataEditorProps) {
  const [activeProfile, setActiveProfile] = useState<string>('default');
  const [profiles, setProfiles] = useState<DataProfile[]>([]);
  const [currentData, setCurrentData] = useState<Record<string, any>>(
    initialData || getSampleData()
  );
  const [editingField, setEditingField] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importCsv, setImportCsv] = useState('');

  // Load profiles from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const loadedProfiles = JSON.parse(stored);
        setProfiles(loadedProfiles);
        
        // Set first profile as active if exists
        if (loadedProfiles.length > 0 && activeProfile === 'default') {
          setActiveProfile(loadedProfiles[0].id);
          setCurrentData(loadedProfiles[0].data);
        }
      } catch (e) {
        console.error('Error loading profiles:', e);
      }
    } else {
      // Create default profile
      const defaultProfile: DataProfile = {
        id: 'default',
        name: 'Default Test Data',
        data: getSampleData(),
        createdAt: new Date().toISOString()
      };
      setProfiles([defaultProfile]);
      saveProfiles([defaultProfile]);
    }
  }, []);

  // Update preview when data or template changes
  useEffect(() => {
    if (templateContent) {
      const preview = replaceMergeTags(templateContent, currentData, {
        preserveUnmatched: true,
        useFallbacks: true
      });
      setPreviewHtml(preview);
    }
    
    onDataChange?.(currentData);
  }, [currentData, templateContent, onDataChange]);

  const saveProfiles = (profilesToSave: DataProfile[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profilesToSave));
  };

  const updateField = (path: string, value: any) => {
    const newData = { ...currentData };
    const keys = path.split('.');
    let obj = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = value;
    setCurrentData(newData);
    
    // Update profile
    const updatedProfiles = profiles.map(p => 
      p.id === activeProfile ? { ...p, data: newData } : p
    );
    setProfiles(updatedProfiles);
    saveProfiles(updatedProfiles);
  };

  const createNewProfile = () => {
    const newProfile: DataProfile = {
      id: `profile_${Date.now()}`,
      name: `Test Profile ${profiles.length + 1}`,
      data: getSampleData(),
      createdAt: new Date().toISOString()
    };
    
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    saveProfiles(updatedProfiles);
    setActiveProfile(newProfile.id);
    setCurrentData(newProfile.data);
  };

  const deleteProfile = (profileId: string) => {
    if (profiles.length <= 1) {
      alert('Cannot delete the last profile');
      return;
    }
    
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    setProfiles(updatedProfiles);
    saveProfiles(updatedProfiles);
    
    if (activeProfile === profileId) {
      setActiveProfile(updatedProfiles[0].id);
      setCurrentData(updatedProfiles[0].data);
    }
  };

  const importFromCsv = () => {
    try {
      const lines = importCsv.trim().split('\n');
      if (lines.length < 2) {
        alert('CSV must have at least a header row and one data row');
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const dataRow = lines[1].split(',').map(v => v.trim());
      
      const importedData: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        const value = dataRow[index] || '';
        const keys = header.split('.');
        let obj = importedData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!obj[keys[i]]) obj[keys[i]] = {};
          obj = obj[keys[i]];
        }
        
        obj[keys[keys.length - 1]] = value;
      });
      
      setCurrentData(importedData);
      
      // Update current profile
      const updatedProfiles = profiles.map(p => 
        p.id === activeProfile ? { ...p, data: importedData } : p
      );
      setProfiles(updatedProfiles);
      saveProfiles(updatedProfiles);
      
      setShowImport(false);
      setImportCsv('');
    } catch (e) {
      alert('Error parsing CSV. Please check the format.');
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(currentData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preview-data-${activeProfile}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const DataField = ({ path, value, type = 'text' }: { path: string; value: any; type?: string }) => {
    const isEditing = editingField === path;
    
    return (
      <div className="flex items-center space-x-2 py-1">
        <Label className="text-sm font-medium w-40">{path}:</Label>
        {isEditing ? (
          <div className="flex items-center space-x-2 flex-1">
            <Input
              type={type}
              value={value}
              onChange={(e) => updateField(path, e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setEditingField(null);
                }
              }}
              className="h-8"
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingField(null)}
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div 
            className="flex-1 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
            onClick={() => setEditingField(path)}
          >
            <span className="text-sm">{value || '(empty)'}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Preview Data Editor</CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={activeProfile} onValueChange={(value: string) => {
                setActiveProfile(value);
                const profile = profiles.find(p => p.id === value);
                if (profile) {
                  setCurrentData(profile.data);
                }
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={createNewProfile}>
                <Plus className="w-4 h-4" />
              </Button>
              {profiles.length > 1 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => deleteProfile(activeProfile)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="editor">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Edit Data</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="import">Import/Export</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Customer Data */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Data
                  </h3>
                  <div className="space-y-2">
                    <DataField path="customer.first_name" value={currentData.customer?.first_name} />
                    <DataField path="customer.last_name" value={currentData.customer?.last_name} />
                    <DataField path="customer.email" value={currentData.customer?.email} type="email" />
                    <DataField path="customer.phone" value={currentData.customer?.phone} />
                    <DataField path="customer.total_orders" value={currentData.customer?.total_orders} type="number" />
                    <DataField path="customer.lifetime_value" value={currentData.customer?.lifetime_value} />
                  </div>
                </div>

                {/* Order Data */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Order Data
                  </h3>
                  <div className="space-y-2">
                    <DataField path="order.number" value={currentData.order?.number} />
                    <DataField path="order.total" value={currentData.order?.total} />
                    <DataField path="order.status" value={currentData.order?.status} />
                    <DataField path="order.tracking_number" value={currentData.order?.tracking_number} />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentData(getSampleData())}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {previewHtml ? (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium mb-3">Rendered Preview</h3>
                  <div 
                    className="bg-white p-4 rounded border"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No template content to preview
                </p>
              )}
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Button onClick={() => setShowImport(!showImport)} className="w-full">
                    <FileUp className="w-4 h-4 mr-2" />
                    Import from CSV
                  </Button>
                  
                  {showImport && (
                    <div className="mt-4 space-y-4">
                      <Textarea
                        placeholder="Paste CSV data here. First row should be headers (e.g., customer.first_name,customer.email)"
                        value={importCsv}
                        onChange={(e) => setImportCsv(e.target.value)}
                        rows={6}
                      />
                      <Button 
                        onClick={importFromCsv}
                        disabled={!importCsv}
                        className="w-full"
                      >
                        Import
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Button onClick={exportData} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export as JSON
                  </Button>
                </div>

                <div className="text-sm text-gray-600 space-y-2">
                  <p>• CSV format: Headers in first row, data in subsequent rows</p>
                  <p>• Use dot notation for nested values (e.g., customer.email)</p>
                  <p>• JSON export includes all current data</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}