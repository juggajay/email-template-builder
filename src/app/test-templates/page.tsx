'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestTemplatesPage() {
  const [data, setData] = useState<any>({
    dbTemplates: [],
    error: null,
    loading: true
  });

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      try {
        // Test 1: Fetch all templates without any filters
        const { data: allTemplates, error: allError } = await supabase
          .from('email_templates')
          .select('*');
          
        // Test 2: Fetch only public templates
        const { data: publicTemplates, error: publicError } = await supabase
          .from('email_templates')
          .select('*')
          .eq('is_public', true);
          
        // Test 3: Count templates
        const { count, error: countError } = await supabase
          .from('email_templates')
          .select('*', { count: 'exact', head: true });
          
        setData({
          allTemplates: allTemplates || [],
          allError,
          publicTemplates: publicTemplates || [],
          publicError,
          totalCount: count || 0,
          countError,
          loading: false
        });
      } catch (error) {
        setData({
          dbTemplates: [],
          error: error,
          loading: false
        });
      }
    }
    
    fetchData();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Template Debug Page</h1>
      
      {data.loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-bold mb-2">Database Status</h2>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({
                totalTemplatesInDB: data.totalCount,
                allTemplatesCount: data.allTemplates?.length || 0,
                publicTemplatesCount: data.publicTemplates?.length || 0,
                errors: {
                  all: data.allError?.message,
                  public: data.publicError?.message,
                  count: data.countError?.message
                }
              }, null, 2)}
            </pre>
          </div>
          
          <div className="bg-blue-100 p-4 rounded">
            <h2 className="font-bold mb-2">All Templates (no filter)</h2>
            {data.allTemplates?.length > 0 ? (
              <ul className="text-sm">
                {data.allTemplates.map((t: any) => (
                  <li key={t.id}>
                    {t.name} - {t.category} - Public: {t.is_public ? 'Yes' : 'No'}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No templates found</p>
            )}
          </div>
          
          <div className="bg-green-100 p-4 rounded">
            <h2 className="font-bold mb-2">Public Templates</h2>
            {data.publicTemplates?.length > 0 ? (
              <ul className="text-sm">
                {data.publicTemplates.map((t: any) => (
                  <li key={t.id}>
                    {t.name} - {t.category}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No public templates found</p>
            )}
          </div>
          
          <div className="bg-yellow-100 p-4 rounded">
            <h2 className="font-bold mb-2">Mock Templates (Always Available)</h2>
            <ul className="text-sm">
              <li>mock-1: Abandoned Cart Reminder</li>
              <li>mock-2: Welcome Series</li>
              <li>mock-3: Order Confirmation</li>
              <li>mock-4: Product Launch Announcement</li>
              <li>mock-5: Flash Sale Alert</li>
            </ul>
          </div>
          
          <div className="bg-purple-100 p-4 rounded">
            <h2 className="font-bold mb-2">Test Links</h2>
            <div className="space-y-2">
              <a href="/templates" className="block text-blue-600 hover:underline">
                → Templates Gallery
              </a>
              <a href="/editor" className="block text-blue-600 hover:underline">
                → Editor (blank)
              </a>
              <a href="/editor?template=mock-1" className="block text-blue-600 hover:underline">
                → Editor with Mock Template
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}