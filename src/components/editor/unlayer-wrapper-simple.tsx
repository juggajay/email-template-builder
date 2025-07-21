'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    unlayer: any;
  }
}

interface UnlayerWrapperSimpleProps {
  initialDesign?: any;
  onReady?: () => void;
  onDesignLoad?: () => void;
  onSave?: (design: any, html: string) => void;
}

export function UnlayerWrapperSimple({ 
  initialDesign, 
  onReady, 
  onDesignLoad,
  onSave 
}: UnlayerWrapperSimpleProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    let script: HTMLScriptElement | null = null;

    const loadUnlayer = async () => {
      // Check if already loaded
      if (window.unlayer) {
        console.log('[UnlayerSimple] Unlayer already loaded');
        initializeEditor();
        return;
      }

      // Create and load script
      script = document.createElement('script');
      script.src = 'https://editor.unlayer.com/embed.js';
      script.async = true;

      script.onload = () => {
        console.log('[UnlayerSimple] Script loaded');
        if (mounted) {
          // Small delay to ensure DOM is ready
          setTimeout(initializeEditor, 100);
        }
      };

      script.onerror = () => {
        console.error('[UnlayerSimple] Failed to load script');
        if (mounted) {
          setError('Failed to load email editor');
          setIsLoading(false);
        }
      };

      document.head.appendChild(script);
    };

    const initializeEditor = () => {
      if (!window.unlayer) {
        console.error('[UnlayerSimple] Unlayer not available');
        setError('Editor not available');
        setIsLoading(false);
        return;
      }

      const container = containerRef.current;
      if (!container) {
        console.error('[UnlayerSimple] Container not found');
        setError('Container not found');
        setIsLoading(false);
        return;
      }

      try {
        console.log('[UnlayerSimple] Initializing with minimal config...');
        
        // Use minimal configuration
        window.unlayer.init({
          id: 'simple-unlayer-editor',
          displayMode: 'email',
          appearance: {
            theme: 'light'
          }
        });

        // Add event listeners
        window.unlayer.addEventListener('editor:ready', () => {
          console.log('[UnlayerSimple] Editor ready');
          setIsLoading(false);
          editorRef.current = window.unlayer;
          
          if (onReady) {
            onReady();
          }

          // Load design after ready
          if (initialDesign) {
            console.log('[UnlayerSimple] Loading initial design...');
            try {
              window.unlayer.loadDesign(initialDesign);
              if (onDesignLoad) {
                onDesignLoad();
              }
            } catch (err) {
              console.error('[UnlayerSimple] Error loading design:', err);
            }
          }
        });

        // Log any drag events
        window.unlayer.addEventListener('design:updated', (data: any) => {
          console.log('[UnlayerSimple] Design updated', data);
        });

      } catch (err) {
        console.error('[UnlayerSimple] Initialization error:', err);
        setError('Failed to initialize editor');
        setIsLoading(false);
      }
    };

    loadUnlayer();

    return () => {
      mounted = false;
      if (script && script.parentNode) {
        document.head.removeChild(script);
      }
      // Clean up Unlayer instance
      if (window.unlayer && window.unlayer.destroy) {
        try {
          window.unlayer.destroy();
        } catch (e) {
          console.error('Error destroying Unlayer:', e);
        }
      }
    };
  }, []);

  const handleExport = () => {
    if (!editorRef.current) return;

    editorRef.current.exportHtml((data: any) => {
      const { design, html } = data;
      console.log('[UnlayerSimple] Exported:', { design, html });
      
      if (onSave) {
        onSave(design, html);
      }
    });
  };

  const handleSaveDesign = () => {
    if (!editorRef.current) return;

    editorRef.current.saveDesign((design: any) => {
      console.log('[UnlayerSimple] Design saved:', design);
      handleExport();
    });
  };

  return (
    <div className="relative h-full">
      {/* Editor container */}
      <div 
        ref={containerRef}
        id="simple-unlayer-editor" 
        style={{ 
          height: '600px',
          width: '100%',
          minHeight: '600px',
          backgroundColor: '#f5f5f5',
          display: isLoading ? 'none' : 'block'
        }} 
      />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading email editor...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-800 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      {!isLoading && !error && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={handleSaveDesign}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Template
          </button>
        </div>
      )}
    </div>
  );
}