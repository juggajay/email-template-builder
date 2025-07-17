'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmailEditor } from '@/components/editor/email-editor';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export default function EditorPage() {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [initialTemplate, setInitialTemplate] = useState<any>(null);
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
      
      // First try to load from email_templates (public templates)
      const { data: publicTemplate, error: publicError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (publicTemplate && !publicError) {
        setInitialTemplate({
          design: publicTemplate.json_design,
          html: publicTemplate.html_content,
          name: publicTemplate.name
        });
        return;
      }

      // If not found, try user_templates
      if (user) {
        const { data: userTemplate, error: userError } = await supabase
          .from('user_templates')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (userTemplate && !userError) {
          setInitialTemplate({
            design: userTemplate.json_design,
            html: userTemplate.html_content,
            name: userTemplate.name
          });
        }
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const handleSave = async (design: any, html: string) => {
    if (!user) {
      alert('Please login to save templates');
      return;
    }

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
          .eq('id', templateId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new template
        const { data, error } = await supabase
          .from('user_templates')
          .insert({
            user_id: user.id,
            template_id: templateId, // Reference to original template if cloned
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
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template. Please try again.');
    }
  };

  const handleExport = async (html: string) => {
    if (!user) {
      alert('Please login to export templates');
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
      a.download = 'email-template.html';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting template:', error);
      alert('Error exporting template. Please try again.');
    }
  };

  return (
    <EmailEditor
      templateId={templateId || undefined}
      initialTemplate={initialTemplate}
      onSave={handleSave}
      onExport={handleExport}
    />
  );
}