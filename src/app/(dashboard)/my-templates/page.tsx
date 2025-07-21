'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyTemplatesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to templates page with my-templates view
    router.replace('/templates?view=my-templates');
  }, [router]);

  return null;
}