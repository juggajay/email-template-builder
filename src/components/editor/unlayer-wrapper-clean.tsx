'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    unlayer: any;
  }
}

interface UnlayerWrapperCleanProps {
  initialDesign?: any;
  onReady?: () => void;
  onDesignLoad?: () => void;
  onSave?: (design: any, html: string) => void;
}

export function UnlayerWrapperClean({ 
  initialDesign, 
  onReady, 
  onDesignLoad,
  onSave 
}: UnlayerWrapperCleanProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const [showSaveButton, setShowSaveButton] = useState(false);

  useEffect(() => {
    let mounted = true;
    let script: HTMLScriptElement | null = null;

    const loadUnlayer = async () => {
      // Check if already loaded
      if (window.unlayer) {
        console.log('[UnlayerClean] Unlayer already loaded');
        initializeEditor();
        return;
      }

      // Load Unlayer script
      script = document.createElement('script');
      script.src = 'https://editor.unlayer.com/embed.js';
      script.async = true;

      script.onload = () => {
        console.log('[UnlayerClean] Script loaded');
        if (mounted) {
          setTimeout(initializeEditor, 100);
        }
      };

      script.onerror = () => {
        console.error('[UnlayerClean] Failed to load script');
        if (mounted) {
          setError('Failed to load email editor');
          setIsLoading(false);
        }
      };

      document.head.appendChild(script);
    };

    const initializeEditor = () => {
      if (!window.unlayer) {
        console.error('[UnlayerClean] Unlayer not found');
        setError('Editor not available');
        setIsLoading(false);
        return;
      }

      try {
        console.log('[UnlayerClean] Initializing Unlayer...');
        
        // Simple configuration focused on functionality
        window.unlayer.init({
          id: 'unlayer-editor-clean',
          displayMode: 'email',
          appearance: {
            theme: 'modern_light'
          },
          features: {
            stockImages: true,
            undoRedo: true
          },
          tools: {
            text: { enabled: true },
            image: { enabled: true },
            button: { enabled: true },
            divider: { enabled: true },
            spacer: { enabled: true },
            social: { enabled: true },
            html: { enabled: true },
            video: { enabled: true },
            columns: { enabled: true }
          }
        });

        window.unlayer.addEventListener('editor:ready', () => {
          console.log('[UnlayerClean] Editor ready');
          setIsLoading(false);
          setShowSaveButton(true);
          editorRef.current = window.unlayer;
          
          if (onReady) {
            onReady();
          }

          // Load design
          if (initialDesign) {
            try {
              window.unlayer.loadDesign(initialDesign);
              if (onDesignLoad) {
                onDesignLoad();
              }
            } catch (err) {
              console.error('[UnlayerClean] Error loading design:', err);
            }
          }
        });

      } catch (err) {
        console.error('[UnlayerClean] Initialization error:', err);
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
    };
  }, []);

  const handleSave = () => {
    console.log('[UnlayerClean] Save button clicked');
    
    if (!editorRef.current) {
      console.error('[UnlayerClean] No editor reference');
      alert('Editor not ready. Please wait and try again.');
      return;
    }

    console.log('[UnlayerClean] Exporting HTML...');
    editorRef.current.exportHtml((data: any) => {
      const { design, html } = data;
      console.log('[UnlayerClean] Export complete');
      
      if (onSave) {
        console.log('[UnlayerClean] Calling onSave...');
        onSave(design, html);
      } else {
        console.warn('[UnlayerClean] No onSave callback provided');
        alert('Save handler not configured');
      }
    });
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Editor container */}
      <div 
        id="unlayer-editor-clean" 
        style={{ 
          height: 'calc(100vh - 200px)',
          minHeight: '600px',
          width: '100%',
          display: isLoading ? 'none' : 'block'
        }} 
      />

      {/* Loading state */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '3px solid #e5e7eb',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite'
            }} />
            <p>Loading email editor...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Save button - Simple and visible */}
      {showSaveButton && !error && (
        <button
          onClick={handleSave}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }}
        >
          <svg 
            width="20" 
            height="20" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" 
            />
          </svg>
          Save Template
        </button>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}