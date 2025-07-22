'use client';

import { useRef, useState } from 'react';
import EmailEditor from 'react-email-editor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Copy, Eye, Save, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailEditorProps {
  templateId?: string;
  onSave?: (design: any, html: string) => void;
}

export function EmailEditorComponent({ templateId, onSave }: EmailEditorProps) {
  const emailEditorRef = useRef<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Export HTML with inline CSS
  const exportHtml = async (action: 'copy' | 'download' | 'preview') => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) return;

    setIsExporting(true);
    
    unlayer.exportHtml(async (data: any) => {
      const { design, html } = data;
      
      try {
        // Call API to inline CSS for better email client compatibility
        const response = await fetch('/api/email/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            html,
            format: 'html',
            options: {
              preserveMediaQueries: true,
              preserveFontFaces: true,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Export failed');
        }

        const { content: inlinedHtml } = await response.json();
        
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
        const response = await fetch('/api/email/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            html,
            format: 'platform',
            platform,
            options: {
              preserveMediaQueries: true,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Export failed');
        }

        const { content: processedHtml } = await response.json();
        
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
        const response = await fetch('/api/email/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            html,
            format: 'html',
            options: {
              inlineCSS: true,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Export failed');
        }

        const { content: inlinedHtml } = await response.json();
        
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

  // Unlayer configuration
  const unlayerOptions = {
    displayMode: 'email' as const,
    features: {
      stockImages: true,
    },
    appearance: {
      theme: 'modern_light' as const,
    },
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
          }}
          options={unlayerOptions}
        />
      </div>
    </div>
  );
}

// Keep the old EmailEditor export for backward compatibility
export { EmailEditorComponent as EmailEditor };