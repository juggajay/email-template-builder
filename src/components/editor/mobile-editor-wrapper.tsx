'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Monitor, 
  Tablet,
  Save,
  ChevronLeft,
  ChevronRight,
  Eye,
  Copy,
  Download,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import EmailEditor from 'react-email-editor';
import '@/styles/unlayer-mobile.css';

interface MobileEditorWrapperProps {
  templateId?: string;
  initialDesign?: any;
  onSave?: (design: any, html: string) => void;
  templateName?: string;
  onTemplateNameChange?: (name: string) => void;
}

export function MobileEditorWrapper({ templateId, initialDesign, onSave, templateName, onTemplateNameChange }: MobileEditorWrapperProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const emailEditorRef = useRef<any>(null);
  const router = useRouter();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load initial design when editor is ready
  useEffect(() => {
    if (editorLoaded && initialDesign && emailEditorRef.current?.editor) {
      emailEditorRef.current.editor.loadDesign(initialDesign);
    }
  }, [editorLoaded, initialDesign]);

  const handleSave = async () => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) return;

    unlayer.saveDesign((design: any) => {
      unlayer.exportHtml((data: any) => {
        const { html } = data;
        if (onSave) {
          onSave(design, html);
        }
      });
    });
  };

  const handleExportHtml = async () => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) return;

    unlayer.exportHtml((data: any) => {
      const { html } = data;
      navigator.clipboard.writeText(html);
      // Show toast notification
      alert('HTML copied to clipboard!');
    });
  };

  const handlePreview = () => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) return;

    unlayer.exportHtml((data: any) => {
      const { html } = data;
      setPreviewHtml(html);
      setActiveTab('preview');
    });
  };

  const handleDownload = () => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) return;

    unlayer.exportHtml((data: any) => {
      const { html } = data;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateName || 'email-template'}.html`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // Mobile View
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Mobile Header */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Email Editor</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Mobile Tab Bar */}
        <div className="bg-white border-b">
          <div className="flex">
            <button
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors",
                activeTab === 'edit' 
                  ? "text-green-600 border-b-2 border-green-600" 
                  : "text-gray-500"
              )}
              onClick={() => setActiveTab('edit')}
            >
              Edit
            </button>
            <button
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors",
                activeTab === 'preview' 
                  ? "text-green-600 border-b-2 border-green-600" 
                  : "text-gray-500"
              )}
              onClick={handlePreview}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'edit' ? (
            <div id="editor-container" className="h-full">
              <EmailEditor
                ref={emailEditorRef}
                onReady={() => setEditorLoaded(true)}
                minHeight="100%"
                options={{
                  displayMode: 'email',
                  features: {
                    stockImages: false, // Disable for mobile performance
                  },
                  tools: {
                    // Simplified tools for mobile
                    heading: { enabled: true },
                    text: { enabled: true },
                    image: { enabled: true },
                    button: { enabled: true },
                    divider: { enabled: true },
                    spacer: { enabled: true },
                    social: { enabled: true },
                    html: { enabled: false },
                  },
                  appearance: {
                    theme: 'light',
                    panels: {
                      tools: {
                        dock: 'left', // Keep default dock position
                        collapsible: true,
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="h-full p-4 overflow-auto">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-medium mb-2">Mobile Preview</h3>
                <div className="border rounded-lg overflow-hidden">
                  <iframe 
                    srcDoc={previewHtml}
                    className="w-full h-96"
                    title="Email Preview"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Actions Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
            <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-lg" onClick={e => e.stopPropagation()}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Actions</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleExportHtml}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy HTML
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  
                  <hr className="my-4" />
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Test on Device
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop View (unchanged)
  return (
    <div className="h-screen flex flex-col">
      {/* Desktop toolbar */}
      <div className="border-b p-4 flex items-center justify-between bg-white">
        <h1 className="text-xl font-semibold">Email Template Editor</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportHtml}>
            <Copy className="h-4 w-4 mr-2" />
            Copy HTML
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>
      
      {/* Desktop editor */}
      <div id="editor-container" className="flex-1">
        <EmailEditor
          ref={emailEditorRef}
          onReady={() => setEditorLoaded(true)}
          minHeight="100%"
          options={{
            displayMode: 'email',
            features: {
              stockImages: true,
            },
            appearance: {
              theme: 'light',
              panels: {
                tools: {
                  dock: 'left',
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}