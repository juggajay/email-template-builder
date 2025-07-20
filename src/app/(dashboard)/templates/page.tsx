'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { TemplateGrid } from '@/components/templates/template-grid';

export const dynamic = 'force-dynamic';

export default function TemplatesPage() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'public' | 'my-templates'>(
    searchParams.get('view') === 'my-templates' ? 'my-templates' : 'public'
  );

  useEffect(() => {
    // Update URL without page reload when view changes
    const newUrl = viewMode === 'my-templates' 
      ? '/templates?view=my-templates' 
      : '/templates';
    window.history.replaceState({}, '', newUrl);
  }, [viewMode]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zebra-black">Templates Library</h1>
        <p className="text-gray-700 mt-2">
          Choose from our collection of email templates
        </p>
      </div>

      {/* Templates grid with integrated filters */}
      <TemplateGrid 
        showUserTemplates={viewMode === 'my-templates'}
        onViewModeChange={setViewMode}
      />
    </div>
  );
}