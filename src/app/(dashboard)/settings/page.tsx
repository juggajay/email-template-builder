'use client';

import { Suspense } from 'react';
import { SettingsContent } from './settings-content';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}