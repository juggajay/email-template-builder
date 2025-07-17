'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { UnlayerWrapper } from '@/components/editor/unlayer-wrapper';
import { UnlayerWrapperSimple } from '@/components/editor/unlayer-wrapper-simple';
import { UnlayerWrapperFixed } from '@/components/editor/unlayer-wrapper-fixed';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { getTemplateDesign } from '@/lib/template-designs';

export const dynamic = 'force-dynamic';

function EditorContent() {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [initialDesign, setInitialDesign] = useState<any>(null);
  const [templateName, setTemplateName] = useState('Untitled Template');
  const [isReady, setIsReady] = useState(false);
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

    try {
      const supabase = createClient();
      
      if (templateId && !templateId.startsWith('mock-')) {
        // Update existing template
        const { error } = await supabase
          .from('user_templates')
          .update({
            json_design: design,
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
            json_design: design,
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
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
            <button
              onClick={() => router.push('/templates')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Back to Templates
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="p-4">
        <div className="max-w-full mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {isReady ? (
            <UnlayerWrapperFixed
              initialDesign={initialDesign}
              onReady={() => console.log('[EditorPage] Unlayer ready')}
              onDesignLoad={() => console.log('[EditorPage] Design loaded')}
              onSave={handleSave}
            />
          ) : (
            <div className="flex items-center justify-center h-[600px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading template...</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
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