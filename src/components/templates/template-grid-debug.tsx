// Add this debug component temporarily to see what's happening

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function TemplateDebug() {
  const [debug, setDebug] = useState<any>({});
  
  useEffect(() => {
    async function checkTemplates() {
      const supabase = createClient();
      
      // 1. Check all templates
      const { data: allTemplates, error: allError } = await supabase
        .from('email_templates')
        .select('id, name, category, is_public')
        .order('created_at', { ascending: false });
        
      // 2. Check abandoned cart templates specifically
      const { data: abandonedCart, error: cartError } = await supabase
        .from('email_templates')
        .select('id, name, category, is_public')
        .eq('category', 'abandoned-cart')
        .eq('is_public', true);
        
      // 3. Check public templates
      const { data: publicTemplates, error: publicError } = await supabase
        .from('email_templates')
        .select('id, name, category, is_public')
        .eq('is_public', true);
        
      setDebug({
        allTemplates: {
          count: allTemplates?.length || 0,
          error: allError,
          data: allTemplates
        },
        abandonedCart: {
          count: abandonedCart?.length || 0,
          error: cartError,
          data: abandonedCart
        },
        publicTemplates: {
          count: publicTemplates?.length || 0,
          error: publicError,
          data: publicTemplates
        }
      });
    }
    
    checkTemplates();
  }, []);
  
  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-auto z-50">
      <h3 className="font-bold mb-2">Template Debug Info</h3>
      <pre className="text-xs">{JSON.stringify(debug, null, 2)}</pre>
    </div>
  );
}