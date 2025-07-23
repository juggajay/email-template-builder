'use client';

import { useRef, useState } from 'react';
import EmailEditor from 'react-email-editor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Copy, Eye, Save, Send, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ExportDialog } from '@/components/email/export-dialog';
import { inliningStrategies } from '@/lib/email/export-options';
import { EmailExportService } from '@/lib/email/export';
import './editor-styles.css';

interface EmailEditorProps {
  templateId?: string;
  onSave?: (design: any, html: string) => void;
}

export function EmailEditorComponent({ templateId, onSave }: EmailEditorProps) {
  const emailEditorRef = useRef<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [currentHtml, setCurrentHtml] = useState<string>('');
  const { toast } = useToast();

  // Export HTML with inline CSS
  const exportHtml = async (action: 'copy' | 'download' | 'preview') => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) return;

    setIsExporting(true);
    
    unlayer.exportHtml(async (data: any) => {
      const { design, html } = data;
      
      try {
        // Inline CSS for better email client compatibility
        const inlinedHtml = EmailExportService.inlineCSS(html, {
          preserveMediaQueries: true,
          preserveFontFaces: true,
          preserveKeyFrames: true,
        });
        
        switch (action) {
          case 'copy':
            await handleCopyHTML(inlinedHtml);
            break;
          case 'download':
            await handleDownloadHTML(inlinedHtml);
            break;
          case 'preview':
            handlePreview(inlinedHtml);
            break;
        }
      } catch (error) {
        toast({
          title: 'Export Error',
          description: 'Failed to export email template',
          variant: 'destructive',
        });
      } finally {
        setIsExporting(false);
      }
    });
  };

  // Copy HTML to clipboard
  const handleCopyHTML = async (html: string) => {
    try {
      await navigator.clipboard.writeText(html);
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
    }
  };

  // Download HTML file
  const handleDownloadHTML = async (html: string) => {
    const blob = new Blob([html], { type: 'text/html' });
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
  };

  // Preview in new window
  const handlePreview = (html: string) => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(html);
      previewWindow.document.close();
    }
  };

  // Export for specific platform
  const exportForPlatform = async (platform: 'klaviyo' | 'mailchimp' | 'sendgrid') => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) return;

    setIsExporting(true);
    
    unlayer.exportHtml(async (data: any) => {
      const { html } = data;
      
      try {
        const processedHtml = await EmailExportService.exportForPlatform(
          html, 
          platform,
          {
            inlineCSS: true,
            preserveMediaQueries: true,
          }
        );
        
        await navigator.clipboard.writeText(processedHtml);
        
        toast({
          title: `Exported for ${platform}!`,
          description: `HTML optimized for ${platform} copied to clipboard`,
        });
      } catch (error) {
        toast({
          title: 'Export Error',
          description: `Failed to export for ${platform}`,
          variant: 'destructive',
        });
      } finally {
        setIsExporting(false);
      }
    });
  };

  // Save template
  const saveTemplate = () => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) return;

    unlayer.exportHtml(async (data: any) => {
      const { design, html } = data;
      
      try {
        // Inline CSS before saving
        const inlinedHtml = EmailExportService.inlineCSS(html, {
          preserveMediaQueries: true,
          preserveFontFaces: true,
        });
        
        if (onSave) {
          onSave(design, inlinedHtml);
        }
      } catch (error) {
        toast({
          title: 'Save Error',
          description: 'Failed to process email template',
          variant: 'destructive',
        });
      }
    });
  };

  // Export with specific strategy
  const exportWithStrategy = async (strategy: keyof typeof inliningStrategies) => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) return;

    setIsExporting(true);
    
    unlayer.exportHtml(async (data: any) => {
      const { html } = data;
      
      try {
        // Use the enhanced export service for strategy-based inlining
        const processedHtml = await EmailExportService.exportAsHTML(html, {
          inlineCSS: true,
          strategy,
          preserveMediaQueries: true,
          preserveFontFaces: true,
        });
        
        // Download the file
        const blob = new Blob([processedHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email-template-${strategy}-${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: 'Exported!',
          description: `Email template exported with ${strategy} strategy`,
        });
      } catch (error) {
        toast({
          title: 'Export Error',
          description: 'Failed to export email template',
          variant: 'destructive',
        });
      } finally {
        setIsExporting(false);
      }
    });
  };

  // Unlayer configuration with ZebaMail branding
  const unlayerOptions = {
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
              onClick={() => exportHtml('preview')}
              disabled={isExporting}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportHtml('copy')}
              disabled={isExporting}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy HTML
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportHtml('download')}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

            {/* Advanced Export Options */}
            <ExportDialog
              html={currentHtml}
              onExport={exportWithStrategy}
              trigger={
                <Button variant="outline" size="sm" disabled={isExporting}>
                  <Settings2 className="w-4 h-4 mr-2" />
                  Advanced
                </Button>
              }
            />
          </div>

          <div className="flex gap-2">
            {/* Platform exports */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportForPlatform('klaviyo')}
              disabled={isExporting}
            >
              Export for Klaviyo
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportForPlatform('mailchimp')}
              disabled={isExporting}
            >
              Export for Mailchimp
            </Button>

            {/* Save button */}
            <Button
              onClick={saveTemplate}
              disabled={isExporting}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>
      </Card>

      {/* Email Editor */}
      <div className="flex-1">
        <EmailEditor
          ref={emailEditorRef}
          onReady={() => {
            // Load template if ID provided
            if (templateId) {
              // Load template design
            }
            
            // Capture HTML periodically for export dialog
            const unlayer = emailEditorRef.current?.editor;
            if (unlayer) {
              const captureHtml = () => {
                unlayer.exportHtml((data: any) => {
                  setCurrentHtml(data.html);
                });
              };
              
              // Initial capture
              setTimeout(captureHtml, 1000);
              
              // Capture on changes
              unlayer.addEventListener('design:updated', captureHtml);
              
              // Inject custom styles into the iframe
              setTimeout(() => {
                const iframe = document.querySelector('iframe') as HTMLIFrameElement;
                if (iframe && iframe.contentDocument) {
                  const style = iframe.contentDocument.createElement('style');
                  style.textContent = `
                    /* ZebaMail Branded Styles - Injected */
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
                    
                    /* Override any inline styles */
                    [style*="background-color: rgb(51, 130, 206)"],
                    [style*="background-color: #3382ce"] {
                      background-color: #10b981 !important;
                    }
                    
                    [style*="border-color: rgb(51, 130, 206)"],
                    [style*="border-color: #3382ce"] {
                      border-color: #10b981 !important;
                    }
                  `;
                  iframe.contentDocument.head.appendChild(style);
                }
              }, 2000); // Wait for iframe to fully load
            }
          }}
          options={unlayerOptions}
        />
      </div>
    </div>
  );
}

// Keep the old EmailEditor export for backward compatibility
export { EmailEditorComponent as EmailEditor };