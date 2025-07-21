'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function VerifyingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // If auth is loaded and we have a user, redirect to dashboard
    if (!loading && user) {
      console.log('[Verifying] User authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
    
    // Timeout fallback - if nothing happens after 5 seconds, redirect anyway
    const timeout = setTimeout(() => {
      console.log('[Verifying] Timeout reached, redirecting to dashboard');
      router.push('/dashboard');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-growth-green mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying your email...</h2>
        <p className="text-gray-600">Please wait while we confirm your account.</p>
        <p className="text-sm text-gray-500 mt-4">You'll be redirected automatically.</p>
      </div>
    </div>
  );
}