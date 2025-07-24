'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TemplateGrid } from '@/components/templates/template-grid';
import { TemplateDebug } from '@/components/templates/template-grid-debug';

export const dynamic = 'force-dynamic';

function TemplatesContent() {
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zebra-black">Templates Library</h1>
        <p className="text-gray-700 mt-2">
          Choose from our collection of email templates
        </p>
      </div>

      {/* Templates grid with integrated filters */}
      <div className="flex-1 overflow-y-auto">
        <TemplateGrid 
          showUserTemplates={viewMode === 'my-templates'}
          onViewModeChange={setViewMode}
        />
      </div>
      
      {/* Temporary debug component */}
      <TemplateDebug />
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-zebra-black">Templates Library</h1>
          <p className="text-gray-700 mt-2">
            Choose from our collection of email templates
          </p>
        </div>
        <div className="text-center py-8">Loading templates...</div>
      </div>
    }>
      <TemplatesContent />
    </Suspense>
  );
}