'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface SaveHandlerProps {
  onSave: (design: any, html: string) => Promise<void>;
  templateName: string;
  className?: string;
}

export function SaveHandler({ onSave, templateName, className = '' }: SaveHandlerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    console.log('[SaveHandler] Save button clicked');
    
    // Get the Unlayer instance
    const unlayer = (window as any).unlayer;
    if (!unlayer) {
      console.error('[SaveHandler] Unlayer not found');
      setSaveError('Editor not ready. Please wait and try again.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Export the design and HTML
      console.log('[SaveHandler] Exporting design...');
      await new Promise<void>((resolve, reject) => {
        unlayer.exportHtml(async (data: any) => {
          try {
            const { design, html } = data;
            console.log('[SaveHandler] Design exported successfully');
            console.log('[SaveHandler] Design size:', JSON.stringify(design).length, 'bytes');
            console.log('[SaveHandler] HTML size:', html.length, 'bytes');
            
            // Check if we have valid data
            if (!design || !html) {
              throw new Error('Invalid template data');
            }
            
            // Call the save handler
            await onSave(design, html);
            
            // Show success
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            
            resolve();
          } catch (error) {
            console.error('[SaveHandler] Save error:', error);
            reject(error);
          }
        });
      });
    } catch (error: any) {
      console.error('[SaveHandler] Error during save:', error);
      setSaveError(error.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  // Check authentication status
  const checkAuth = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  const handleClick = async () => {
    // First check if user is authenticated
    const user = await checkAuth();
    if (!user) {
      setSaveError('Please sign in to save templates');
      // Optionally redirect to login
      // window.location.href = '/login';
      return;
    }
    
    await handleSave();
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isSaving}
        className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg ${className}`}
      >
        {isSaving ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Saving...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Template
          </>
        )}
      </button>

      {/* Error message */}
      {saveError && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{saveError}</span>
            <button
              onClick={() => setSaveError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Success message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Template saved successfully!</span>
          </div>
        </div>
      )}
    </>
  );
}