'use client';

import { useState } from 'react';
import { TemplateGrid } from '@/components/templates/template-grid';

export const dynamic = 'force-dynamic';

export default function TemplatesPage() {
  const [viewMode, setViewMode] = useState<'public' | 'my-templates'>('public');

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
      />
    </div>
  );
}