'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmailEditor } from '@/components/editor/email-editor';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export default function EditorPage() {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

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
      onSave={handleSave}
      onExport={handleExport}
    />
  );
}