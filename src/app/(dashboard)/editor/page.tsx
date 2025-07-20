'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { UnlayerWrapper } from '@/components/editor/unlayer-wrapper';
import { UnlayerWrapperSimple } from '@/components/editor/unlayer-wrapper-simple';
import { UnlayerWrapperFixed } from '@/components/editor/unlayer-wrapper-fixed';
import { UnlayerWrapperFast } from '@/components/editor/unlayer-wrapper-fast';
import { UnlayerWrapperClean } from '@/components/editor/unlayer-wrapper-clean';
import { MobileEditorWrapper } from '@/components/editor/mobile-editor-wrapper';
import { EnhancedMergeTagsPanel } from '@/components/editor/merge-tags-enhanced/panel';
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
import { Sparkles, Eye, Filter } from 'lucide-react';

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
  const { user } = useAuth();
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

  const handleSave = async (design: any, html: string) => {
    if (!user) {
      alert('Please sign in to save templates');
      return;
    }

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
        alert(`Template validation failed:\n${errors.map(e => e.message).join('\n')}`);
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

        if (error) throw error;
        console.log('[EditorPage] Template updated successfully');
      } else {
        // Create new template
        const { data, error } = await supabase
          .from('user_templates')
          .insert({
            user_id: user.id,
            template_id: null, // This will be a custom template
            name: templateName,
            json_design: enhancedDesign,
            html_content: html,
          })
          .select()
          .single();

        if (error) throw error;
        setTemplateId(data.id);
        console.log('[EditorPage] New template created successfully');
      }

      // Show success message
      alert('Template saved successfully!');
    } catch (error) {
      console.error('[EditorPage] Error saving template:', error);
      alert('Failed to save template. Please try again.');
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
            <button
              onClick={() => router.push('/templates')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Back to Templates
            </button>
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
                  onReady={() => console.log('[EditorPage] Unlayer ready')}
                  onDesignLoad={() => console.log('[EditorPage] Design loaded')}
                  onSave={handleSave}
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