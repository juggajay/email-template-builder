'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestBetaPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const testBetaInvite = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Test calling the function directly
      const { data, error } = await supabase.rpc('use_beta_invite', {
        invite_code: 'BETA-TEST123',
        user_id: '79012ac9-fd3f-44d9-b05e-d863ee5b9423' // Replace with a real user ID
      });
      
      setResult({
        success: !error,
        data,
        error: error ? {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        } : null
      });
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        catchError: true
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Beta Invite Function</h1>
      
      <button
        onClick={testBetaInvite}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Beta Invite'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Debug Info</h2>
        <p className="text-sm text-gray-600">
          This page tests the beta invite function directly to see if it's working properly.
        </p>
      </div>
    </div>
  );
}