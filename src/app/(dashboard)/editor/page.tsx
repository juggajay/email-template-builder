'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import dynamicImport from 'next/dynamic';
import { EditorSkeleton, PanelSkeleton } from '@/components/editor/editor-skeleton';

// Dynamically import heavy editor components
const UnlayerWrapperFixed = dynamicImport(
  () => import('@/components/editor/unlayer-wrapper-fixed').then(mod => mod.UnlayerWrapperFixed),
  {
    ssr: false,
    loading: () => <EditorSkeleton />
  }
);

const MobileEditorWrapper = dynamicImport(
  () => import('@/components/editor/mobile-editor-wrapper').then(mod => mod.MobileEditorWrapper),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mobile editor...</p>
        </div>
      </div>
    ),
  }
);
// Dynamically import enhanced merge tags components
const EnhancedMergeTagsPanel = dynamicImport(
  () => import('@/components/editor/merge-tags-enhanced/panel').then(mod => mod.EnhancedMergeTagsPanel),
  {
    ssr: false,
    loading: () => <PanelSkeleton />
  }
);

import { PreviewDataEditor } from '@/components/editor/merge-tags-enhanced/preview-data';
import { ConditionalEditor } from '@/components/editor/merge-tags-enhanced/conditional-editor';
import { MergeTagAutocomplete } from '@/components/editor/merge-tags-enhanced/autocomplete';
import { SendTestEmail } from '@/components/email/send-test-email';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { getTemplateDesign } from '@/lib/template-designs';
import { ConditionalBlock } from '@/lib/merge-tags/conditional';
import { findAllMergeTags } from '@/lib/merge-tags/parser';
import { validateTemplate } from '@/lib/merge-tags/validator';
import { getAllMergeTags } from '@/lib/merge-tags';
import { Button } from '@/components/ui/button';
import { Sparkles, Eye, Filter, Save, ChevronDown, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyHTMLToClipboard } from '@/lib/email/export';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import '@/styles/unlayer-mobile.css';

export const dynamic = 'force-dynamic';

function EditorContent() {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [initialDesign, setInitialDesign] = useState<any>(null);
  const [templateName, setTemplateName] = useState('Untitled Template');
  const [isReady, setIsReady] = useState(false);
  const [showEnhancedPanel, setShowEnhancedPanel] = useState(false);
  const [showPreviewData, setShowPreviewData] = useState(false);
  const [showConditional, setShowConditional] = useState(false);
  const [conditionalBlocks, setConditionalBlocks] = useState<ConditionalBlock[]>([]);
  const [previewData, setPreviewData] = useState<Record<string, any>>({});
  const [usedTags, setUsedTags] = useState<string[]>([]);
  const [templateHtml, setTemplateHtml] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveRetryCount, setSaveRetryCount] = useState(0);
  const [editorRef, setEditorRef] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get template ID from URL
    const templateParam = searchParams.get('template');
    console.log('[EditorPage] Template param:', templateParam);
    
    if (templateParam) {
      setTemplateId(templateParam);
      loadTemplate(templateParam);
    } else {
      // No template specified, start with blank
      setIsReady(true);
    }
  }, [searchParams]);

  const loadTemplate = async (id: string) => {
    console.log('[EditorPage] Loading template:', id);
    
    try {
      // Handle mock templates
      if (id.startsWith('mock-')) {
        const mockTemplates = {
          'mock-1': { name: 'Abandoned Cart Reminder', category: 'abandoned-cart' },
          'mock-2': { name: 'Welcome Series', category: 'welcome' },
          'mock-3': { name: 'Order Confirmation', category: 'order-confirmation' },
          'mock-4': { name: 'Product Launch Announcement', category: 'product-launch' },
          'mock-5': { name: 'Flash Sale Alert', category: 'promotional' }
        };
        
        const mockTemplate = mockTemplates[id as keyof typeof mockTemplates];
        if (mockTemplate) {
          const design = getTemplateDesign(mockTemplate.name);
          console.log('[EditorPage] Mock template design loaded');
          setInitialDesign(design);
          setTemplateName(mockTemplate.name);
          setIsReady(true);
          return;
        }
      }

      const supabase = createClient();
      
      // Load from email_templates (public templates)
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (data && !error) {
        setTemplateName(data.name);
        
        // Set the initial design if it exists
        if (data.json_design) {
          console.log('[EditorPage] Using existing json_design from database');
          setInitialDesign(data.json_design);
        } else {
          // Generate a design based on the template name/category
          console.log('[EditorPage] Generating design for template:', data.name);
          const design = getTemplateDesign(data.name);
          setInitialDesign(design);
        }
      } else {
        console.error('[EditorPage] Template not found, using default design');
        // Use a default design if template not found
        const design = getTemplateDesign('Welcome Series');
        setInitialDesign(design);
        setTemplateName('Welcome Template');
      }
    } catch (error) {
      console.error('[EditorPage] Error loading template:', error);
      // Use a default design on error
      const design = getTemplateDesign('Welcome Series');
      setInitialDesign(design);
      setTemplateName('Welcome Template');
    } finally {
      setIsReady(true);
    }
  };

  const handleSave = async (design: any, html: string, shouldExit: boolean = false, retryCount: number = 0) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save templates.",
        variant: "destructive"
      });
      return;
    }

    // Validate input data
    if (!design || !html || html.trim() === '') {
      toast({
        title: "Invalid template data",
        description: "Cannot save empty template. Please add some content first.",
        variant: "destructive"
      });
      return;
    }

    console.log('[EditorPage] Starting save operation', {
      shouldExit,
      templateId,
      templateName,
      userId: user.id,
      isNewTemplate: !templateId || templateId.startsWith('mock-'),
      htmlLength: html?.length || 0,
      designKeys: design ? Object.keys(design) : []
    });
    
    setIsSaving(true);

    // Update template HTML for preview
    setTemplateHtml(html);
    
    // Extract used tags
    const tags = findAllMergeTags(html);
    setUsedTags(tags.map(t => t.fullTag));

    // Validate template
    const validation = validateTemplate(html, conditionalBlocks, {
      availableTags: getAllMergeTags().map(t => t.value.replace(/[{}]/g, ''))
    });
    
    if (!validation.valid) {
      const errors = validation.issues.filter(i => i.type === 'error');
      if (errors.length > 0) {
        toast({
          title: "Template validation failed",
          description: `${errors.map(e => e.message).join(', ')}`,
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
    }

    try {
      const supabase = createClient();
      
      // Include enhanced data in the save
      const enhancedDesign = {
        ...design,
        conditionalBlocks,
        mergeTagsMetadata: {
          usedTags,
          validation: validation.stats
        }
      };
      
      if (templateId && !templateId.startsWith('mock-')) {
        // Update existing template
        const { error } = await supabase
          .from('user_templates')
          .update({
            json_design: enhancedDesign,
            html_content: html,
            last_modified: new Date().toISOString(),
          })
          .eq('id', templateId);

        if (error) {
          console.error('[EditorPage] Update error:', error);
          throw error;
        }
        console.log('[EditorPage] Template updated successfully', {
          templateId,
          enhancedDesign,
          htmlLength: html.length
        });
      } else {
        // Create new template
        // Generate a thumbnail URL (placeholder for now)
        const thumbnailUrl = `https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop&text=${encodeURIComponent(templateName)}`;
        
        const { data, error } = await supabase
          .from('user_templates')
          .insert({
            user_id: user.id,
            template_id: null, // This will be a custom template
            name: templateName,
            json_design: enhancedDesign,
            html_content: html,
            thumbnail_url: thumbnailUrl,
          })
          .select()
          .single();

        if (error) {
          console.error('[EditorPage] Insert error:', error);
          throw error;
        }
        if (!data) {
          throw new Error('No data returned after template creation');
        }
        setTemplateId(data.id);
        console.log('[EditorPage] New template created successfully', {
          newTemplateId: data.id,
          templateName,
          htmlLength: html.length
        });
      }

      // Show success message
      toast({
        title: "Template saved successfully!",
        description: shouldExit ? "Redirecting to templates..." : "Your changes have been saved.",
        variant: "default",
      });
      
      // If shouldExit is true, navigate back to templates
      if (shouldExit) {
        setTimeout(() => {
          router.push('/templates?view=my-templates');
        }, 1000);
      }
    } catch (error: any) {
      console.error('[EditorPage] Error saving template:', error);
      
      // Check if this is a retryable error and we haven't exceeded retry limit
      const isRetryableError = error?.message?.includes('network') || 
                              error?.message?.includes('timeout') || 
                              error?.code === 'PGRST301' ||
                              error?.message?.includes('502') ||
                              error?.message?.includes('503');
      
      if (isRetryableError && retryCount < 3) {
        console.log('[EditorPage] Retrying save operation, attempt:', retryCount + 1);
        setSaveRetryCount(retryCount + 1);
        
        toast({
          title: "Save failed, retrying...",
          description: `Attempt ${retryCount + 1} of 3`,
          variant: "default",
        });
        
        // Wait a moment before retrying with exponential backoff
        setTimeout(() => {
          handleSave(design, html, shouldExit, retryCount + 1);
        }, Math.pow(2, retryCount) * 1000); // 1s, 2s, 4s delays
        
        return;
      }
      
      // Reset retry count
      setSaveRetryCount(0);
      
      // Provide more detailed error messages
      let errorMessage = 'Failed to save template.';
      
      if (error?.message?.includes('auth')) {
        errorMessage = 'Authentication error. Please sign in again.';
      } else if (error?.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error?.code === '23505') {
        errorMessage = 'A template with this name already exists.';
      } else if (error?.code === 'PGRST301') {
        errorMessage = 'Permission denied. Please sign in again.';
      } else if (retryCount > 0) {
        errorMessage = `Failed to save after ${retryCount + 1} attempts. ${error?.message || ''}`;
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast({
        title: "Failed to save template",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Log detailed error info for debugging
      console.error('[EditorPage] Detailed error info:', {
        error,
        templateId,
        templateName,
        userId: user?.id,
        isNewTemplate: !templateId || templateId.startsWith('mock-'),
        errorCode: error?.code,
        errorMessage: error?.message,
        errorDetails: error?.details,
        retryCount,
        isRetryableError
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (html: string) => {
    if (!user) {
      alert('Please sign in to export templates');
      return;
    }

    try {
      const supabase = createClient();
      
      // Record the export
      const { error } = await supabase
        .from('template_exports')
        .insert({
          user_id: user.id,
          template_id: templateId,
          export_type: 'html',
          file_size: new Blob([html]).size,
        });

      if (error) throw error;

      // Download the HTML file
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}.html`;
      a.click();
      URL.revokeObjectURL(url);
      
      console.log('[EditorPage] Template exported successfully');
    } catch (error) {
      console.error('[EditorPage] Error exporting template:', error);
      alert('Failed to export template. Please try again.');
    }
  };

  // Check if mobile device
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle save actions from the header
  const handleSaveAndExit = async () => {
    if (!editorRef || !editorRef.exportHtml) {
      toast({
        title: "Editor not ready",
        description: "Please wait for the editor to load and try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        editorRef.exportHtml((data: any) => {
          try {
            const { design, html } = data;
            if (!design || !html) {
              reject(new Error('Invalid template data'));
              return;
            }
            handleSave(design, html, true);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('[EditorPage] Error in handleSaveAndExit:', error);
      toast({
        title: "Failed to save",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!editorRef || !editorRef.exportHtml) {
      toast({
        title: "Editor not ready",
        description: "Please wait for the editor to load and try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        editorRef.exportHtml((data: any) => {
          try {
            const { design, html } = data;
            if (!design || !html) {
              reject(new Error('Invalid template data'));
              return;
            }
            handleSave(design, html, false);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('[EditorPage] Error in handleSaveAsTemplate:', error);
      toast({
        title: "Failed to save",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleChangeTemplate = () => {
    if (window.confirm('Are you sure you want to change template? Any unsaved changes will be lost.')) {
      router.push('/templates');
    }
  };

  const handleCopyHTML = async () => {
    if (!editorRef || !editorRef.exportHtml) {
      toast({
        title: "Editor not ready",
        description: "Please wait for the editor to load and try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        editorRef.exportHtml(async (data: any) => {
          try {
            const { html } = data;
            if (!html) {
              reject(new Error('No HTML data'));
              return;
            }
            await copyHTMLToClipboard(html);
            // Also update templateHtml for SendTestEmail
            setTemplateHtml(html);
            toast({
              title: "HTML copied!",
              description: "The HTML has been copied to your clipboard.",
              variant: "default"
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('[EditorPage] Error copying HTML:', error);
      toast({
        title: "Failed to copy HTML",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  // Use mobile wrapper for mobile devices
  if (isMobile) {
    return (
      <>
        {isReady ? (
          <MobileEditorWrapper
            initialDesign={initialDesign}
            onSave={handleSave}
            templateName={templateName}
            onTemplateNameChange={setTemplateName}
          />
        ) : (
          <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading template...</p>
            </div>
          </div>
        )}
        <Script src="/performance-optimizations.js" strategy="afterInteractive" />
        {process.env.NODE_ENV === 'development' && (
          <Script src="/debug-unlayer.js" strategy="afterInteractive" />
        )}
      </>
    );
  }

  // Desktop layout
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-lg font-medium border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1"
              placeholder="Template name"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEnhancedPanel(!showEnhancedPanel)}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Merge Tags
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreviewData(!showPreviewData)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConditional(!showConditional)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Conditionals
            </Button>
            <SendTestEmail 
              templateHtml={templateHtml}
              templateSubject={`Preview: ${templateName}`}
              onEmailSent={(result) => {
                console.log('Test email sent:', result);
              }}
            />
            
            {/* Copy HTML Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyHTML}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy HTML
            </Button>
            
            {/* Save & Exit Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="bg-growth-green hover:bg-growth-green-600 text-white flex items-center gap-2"
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save & Exit'
                  )}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={handleSaveAndExit}
                  disabled={isSaving}
                  className="cursor-pointer"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save & Exit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleSaveAsTemplate}
                  disabled={isSaving}
                  className="cursor-pointer"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Template
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleChangeTemplate}
                  className="cursor-pointer"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Change Template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content area with editor and panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor - takes remaining width */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full max-w-full mx-auto bg-white rounded-lg shadow-lg overflow-hidden relative">
            {isReady ? (
              <>
                <UnlayerWrapperFixed
                  initialDesign={initialDesign}
                  onReady={(editor) => {
                    console.log('[EditorPage] Unlayer ready');
                    setEditorRef(editor);
                    // Export initial HTML for SendTestEmail
                    if (editor && editor.exportHtml) {
                      editor.exportHtml((data: any) => {
                        setTemplateHtml(data.html);
                      });
                    }
                  }}
                  onDesignLoad={() => {
                    console.log('[EditorPage] Design loaded');
                    // Export HTML when design loads
                    if (editorRef && editorRef.exportHtml) {
                      editorRef.exportHtml((data: any) => {
                        setTemplateHtml(data.html);
                      });
                    }
                  }}
                  onSave={handleSave}
                  onDesignUpdate={(design, html) => {
                    // Update template HTML whenever design changes
                    setTemplateHtml(html);
                  }}
                  hideBottomSaveButton={true}
                />
                <MergeTagAutocomplete
                  onTagInsert={(tag) => console.log('Tag inserted:', tag)}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading template...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side panels */}
        {(showEnhancedPanel || showPreviewData || showConditional) && (
          <div className="w-96 border-l bg-white p-4 overflow-y-auto">
            {showEnhancedPanel && (
              <div className="mb-4">
                <EnhancedMergeTagsPanel
                  onTagSelect={(tag) => console.log('Tag selected:', tag)}
                  onTagsUsedUpdate={setUsedTags}
                  usedTags={usedTags}
                />
              </div>
            )}
            
            {showPreviewData && (
              <div className="mb-4">
                <PreviewDataEditor
                  onDataChange={setPreviewData}
                  templateContent={templateHtml}
                />
              </div>
            )}
            
            {showConditional && (
              <div className="mb-4">
                <ConditionalEditor
                  blocks={conditionalBlocks}
                  onBlocksChange={setConditionalBlocks}
                  testData={previewData}
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Performance optimization script */}
      <Script src="/performance-optimizations.js" strategy="afterInteractive" />
      
      {/* Debug script for development */}
      {process.env.NODE_ENV === 'development' && (
        <Script src="/debug-unlayer.js" strategy="afterInteractive" />
      )}
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}