'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmailEditor } from '@/components/editor/email-editor';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { getTemplateDesign } from '@/lib/template-designs';

export const dynamic = 'force-dynamic';

function EditorContent() {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [initialDesign, setInitialDesign] = useState<any>(null);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get template ID from URL
    const templateParam = searchParams.get('template');
    if (templateParam) {
      setTemplateId(templateParam);
      loadTemplate(templateParam);
    }
  }, [searchParams]);

  const loadTemplate = async (id: string) => {
    try {
      const supabase = createClient();
      
      // Load from email_templates (public templates)
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (data && !error) {
        // Set the initial design if it exists
        if (data.json_design) {
          setInitialDesign(data.json_design);
        } else {
          // Generate a design based on the template name/category
          const design = getTemplateDesign(data.name);
          setInitialDesign(design);
        }
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const handleSave = async (design: any, html: string) => {
    if (!user) return;

    try {
      const supabase = createClient();
      
      if (templateId) {
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
      } else {
        // Create new template
        const { data, error } = await supabase
          .from('user_templates')
          .insert({
            user_id: user.id,
            template_id: null, // This will be a custom template
            name: 'Untitled Template',
            json_design: design,
            html_content: html,
          })
          .select()
          .single();

        if (error) throw error;
        setTemplateId(data.id);
      }

      // Show success message
      console.log('Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleExport = async (html: string) => {
    if (!user) return;

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
      a.download = 'email-template.html';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting template:', error);
    }
  };

  return (
    <EmailEditor
      templateId={templateId || undefined}
      initialDesign={initialDesign}
      onSave={handleSave}
      onExport={handleExport}
    />
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