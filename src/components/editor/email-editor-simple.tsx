'use client';

import { useRef, useState } from 'react';
import EmailEditor from 'react-email-editor';
import { Copy, Download, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmailExportService } from '@/lib/email/export';
import { useToast } from '@/hooks/use-toast';
import './editor-styles.css';

interface SimpleEmailEditorProps {
  templateId?: string;
  onSave?: (design: any, html: string) => void;
}

export function SimpleEmailEditor({ templateId, onSave }: SimpleEmailEditorProps) {
  const editorRef = useRef<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleCopyHTML = async () => {
    if (!editorRef.current) return;

    setIsExporting(true);
    
    editorRef.current.editor.exportHtml(async (data: any) => {
      const { html } = data;
      
      try {
        // Inline CSS before copying
        const inlinedHtml = EmailExportService.inlineCSS(html, {
          preserveMediaQueries: true,
          preserveFontFaces: true,
          preserveKeyFrames: true,
        });
        
        // Copy to clipboard
        await navigator.clipboard.writeText(inlinedHtml);
        
        toast({
          title: 'Copied!',
          description: 'HTML with inline CSS copied to clipboard',
        });
      } catch (error) {
        toast({
          title: 'Copy Failed',
          description: 'Failed to copy HTML to clipboard',
          variant: 'destructive',
        });
      } finally {
        setIsExporting(false);
      }
    });
  };

  const handleDownloadHTML = async () => {
    if (!editorRef.current) return;

    setIsExporting(true);
    
    editorRef.current.editor.exportHtml(async (data: any) => {
      const { html } = data;
      
      try {
        // Inline CSS before downloading
        const inlinedHtml = EmailExportService.inlineCSS(html, {
          preserveMediaQueries: true,
          preserveFontFaces: true,
          preserveKeyFrames: true,
        });
        
        // Create and download file
        const blob = new Blob([inlinedHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email-template-${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: 'Downloaded!',
          description: 'Email template downloaded with inline CSS',
        });
      } catch (error) {
        toast({
          title: 'Download Failed',
          description: 'Failed to download template',
          variant: 'destructive',
        });
      } finally {
        setIsExporting(false);
      }
    });
  };

  const handlePreview = () => {
    if (!editorRef.current) return;
    
    editorRef.current.editor.exportHtml((data: any) => {
      const { html } = data;
      
      // Inline CSS for preview
      const inlinedHtml = EmailExportService.inlineCSS(html, {
        preserveMediaQueries: true,
        preserveFontFaces: true,
      });
      
      // Open in new window
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(inlinedHtml);
        previewWindow.document.close();
      }
    });
  };

  const handleSave = () => {
    if (!editorRef.current) return;
    
    editorRef.current.editor.exportHtml((data: any) => {
      const { design, html } = data;
      
      // Inline CSS before saving
      const inlinedHtml = EmailExportService.inlineCSS(html, {
        preserveMediaQueries: true,
        preserveFontFaces: true,
      });
      
      if (onSave) {
        onSave(design, inlinedHtml);
      }
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <Card className="rounded-none border-x-0 border-t-0 p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyHTML}
              disabled={isExporting}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy HTML
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadHTML}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          <Button
            onClick={handleSave}
            disabled={isExporting}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </Card>

      {/* Email Editor */}
      <div className="flex-1">
        <EmailEditor
          ref={editorRef}
          onReady={() => {
            // Load template if ID provided
            if (templateId) {
              // Load template design
              console.log('Loading template:', templateId);
            }
          }}
          options={{
            displayMode: 'email' as const,
            features: {
              stockImages: true,
            },
            appearance: {
              theme: 'modern_light' as const,
            },
            customCSS: `
              /* ZebaMail Branded Styles */
              .blockbuilder-content-wrapper,
              .blockbuilder-content,
              .u-row,
              .u-col {
                background-color: transparent !important;
              }
              
              .blockbuilder-content {
                border: 2px solid #e5e7eb !important;
                border-radius: 8px !important;
                background: #ffffff !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
              }
              
              .u-row.ui-droppable-hover,
              .u-col.ui-droppable-hover {
                background-color: rgba(16, 185, 129, 0.05) !important;
                outline: 2px solid #10b981 !important;
              }
              
              .u-row:hover,
              .u-col:hover {
                outline: 1px solid #10b981 !important;
                background-color: rgba(16, 185, 129, 0.02) !important;
              }
              
              .blockbuilder-layer-selected,
              .u-row.selected,
              .u-col.selected {
                background-color: rgba(16, 185, 129, 0.05) !important;
                outline: 2px solid #10b981 !important;
                box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important;
              }
              
              .blockbuilder-row-add-button {
                background-color: #ffffff !important;
                border: 2px solid #e5e7eb !important;
                color: #10b981 !important;
              }
              
              .blockbuilder-row-add-button:hover {
                background-color: #10b981 !important;
                color: #ffffff !important;
              }
            `,
          }}
        />
      </div>
    </div>
  );
}

// Example usage component
export function EmailEditorExample() {
  const handleSave = (design: any, html: string) => {
    console.log('Design:', design);
    console.log('HTML (with inline CSS):', html);
    
    // Save to your backend
    // The HTML already has inline CSS applied
  };

  return (
    <SimpleEmailEditor
      onSave={handleSave}
    />
  );
}