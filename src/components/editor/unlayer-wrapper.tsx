'use client';

import { useEffect, useRef, useState } from 'react';
import './editor-styles.css';

declare global {
  interface Window {
    unlayer: any;
  }
}

interface UnlayerWrapperProps {
  initialDesign?: any;
  onReady?: () => void;
  onDesignLoad?: () => void;
  onSave?: (design: any, html: string) => void;
}

export function UnlayerWrapper({ 
  initialDesign, 
  onReady, 
  onDesignLoad,
  onSave 
}: UnlayerWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const initAttempts = useRef(0);
  const maxAttempts = 10;

  useEffect(() => {
    let mounted = true;
    let script: HTMLScriptElement | null = null;

    const loadUnlayer = async () => {
      // Check if already loaded
      if (window.unlayer) {
        console.log('[UnlayerWrapper] Unlayer already loaded');
        initializeEditor();
        return;
      }

      // Create and load script
      script = document.createElement('script');
      script.src = 'https://editor.unlayer.com/embed.js';
      script.async = true;

      script.onload = () => {
        console.log('[UnlayerWrapper] Script loaded');
        if (mounted) {
          initializeEditor();
        }
      };

      script.onerror = () => {
        console.error('[UnlayerWrapper] Failed to load script');
        if (mounted) {
          setError('Failed to load email editor');
          setIsLoading(false);
        }
      };

      document.head.appendChild(script);
    };

    const initializeEditor = () => {
      initAttempts.current++;
      
      if (!window.unlayer) {
        console.log(`[UnlayerWrapper] Waiting for unlayer... (attempt ${initAttempts.current}/${maxAttempts})`);
        
        if (initAttempts.current < maxAttempts) {
          setTimeout(initializeEditor, 50); // Quick retry for DOM // Reduced from 500ms to 100ms
        } else {
          setError('Editor initialization timeout');
          setIsLoading(false);
        }
        return;
      }

      const container = document.getElementById('unlayer-editor');
      if (!container) {
        console.error('[UnlayerWrapper] Container element not found');
        if (initAttempts.current < maxAttempts) {
          setTimeout(initializeEditor, 100);
        } else {
          setError('Editor container not found');
          setIsLoading(false);
        }
        return;
      }

      try {
        console.log('[UnlayerWrapper] Initializing Unlayer...');
        
        window.unlayer.init({
          id: 'unlayer-editor',
          displayMode: 'email',
          appearance: {
            theme: 'modern_light',
            panels: {
              tools: { 
                dock: 'left',
                collapsible: true
              },
              properties: { 
                dock: 'right',
                collapsible: true
              }
            }
          },
          locale: 'en-US',
          features: {
            colorPicker: true,
            undoRedo: true,
            stockImages: true,
            textEditor: {
              spellChecker: true,
              tables: true,
              emojis: true,
              cleanPaste: true,
              autoLink: true
            },
            imageEditor: true,
            userUploads: true
          },
          tools: {
            form: {
              enabled: true
            },
            button: {
              enabled: true,
              properties: {
                buttonColors: {
                  defaultValue: '#3182ce'
                }
              }
            }
          },
          options: {
            backgroundColor: '#ffffff',
            defaultFonts: {
              'Helvetica': 'Helvetica, Arial, sans-serif',
              'Arial': 'Arial, Helvetica, sans-serif',
              'Georgia': 'Georgia, serif',
              'Tahoma': 'Tahoma, Geneva, sans-serif',
              'Times New Roman': 'Times New Roman, Times, serif',
              'Verdana': 'Verdana, Geneva, sans-serif'
            }
          },
          mergeTags: {
            customer: {
              name: 'Customer',
              mergeTags: {
                first_name: {
                  name: 'First Name',
                  value: '{{customer.first_name}}'
                },
                email: {
                  name: 'Email',
                  value: '{{customer.email}}'
                }
              }
            },
            order: {
              name: 'Order',
              mergeTags: {
                order_number: {
                  name: 'Order Number',
                  value: '{{order.number}}'
                },
                total: {
                  name: 'Total',
                  value: '{{order.total}}'
                }
              }
            }
          },
          // ZebaMail Branded Styles
          customCSS: `
            .blockbuilder-content-wrapper,
            .blockbuilder-content,
            .u-row,
            .u-col {
              background-color: transparent !important;
            }
            
            .blockbuilder-content {
              border: 2px solid #e5e7eb !important;
              border-radius: 8px !important;
              background: #ffffff !important;
            }
            
            /* Green hover states */
            .u-row.ui-droppable-hover,
            .u-col.ui-droppable-hover,
            .u-row-droppable-hover,
            .u-col-droppable-hover {
              background-color: rgba(16, 185, 129, 0.05) !important;
              outline: 2px solid #10b981 !important;
              outline-offset: -2px;
            }
            
            .u-row:hover,
            .u-col:hover {
              outline: 1px solid #10b981 !important;
              background-color: rgba(16, 185, 129, 0.02) !important;
            }
            
            /* Green selected states */
            .blockbuilder-layer-selected,
            .u-row.selected,
            .u-col.selected {
              background-color: rgba(16, 185, 129, 0.05) !important;
              outline: 2px solid #10b981 !important;
              box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important;
            }
            
            /* Green add buttons */
            .blockbuilder-row-add-button,
            .blockbuilder-add-button {
              background-color: #ffffff !important;
              border: 2px solid #e5e7eb !important;
              color: #10b981 !important;
            }
            
            .blockbuilder-row-add-button:hover,
            .blockbuilder-add-button:hover {
              background-color: #10b981 !important;
              border-color: #10b981 !important;
              color: #ffffff !important;
            }
            
            /* Override blue inline styles */
            [style*="background-color: rgb(51, 130, 206)"],
            [style*="background-color: #3382ce"] {
              background-color: #10b981 !important;
            }
            
            [style*="border-color: rgb(51, 130, 206)"],
            [style*="border-color: #3382ce"] {
              border-color: #10b981 !important;
            }
          `
        });

        window.unlayer.addEventListener('editor:ready', () => {
          console.log('[UnlayerWrapper] Editor ready');
          setIsLoading(false);
          editorRef.current = window.unlayer;
          
          if (onReady) {
            onReady();
          }

          // Load initial design if provided, otherwise load blank design
          if (initialDesign) {
            console.log('[UnlayerWrapper] Loading initial design...');
            try {
              window.unlayer.loadDesign(initialDesign);
              console.log('[UnlayerWrapper] Design loaded successfully');
              if (onDesignLoad) {
                onDesignLoad();
              }
            } catch (err) {
              console.error('[UnlayerWrapper] Error loading design:', err);
            }
          } else {
            console.log('[UnlayerWrapper] No initial design, loading blank template');
            // Load a minimal blank design to ensure editor is visible
            const blankDesign = {
              body: {
                id: '',
                rows: [],
                headers: [],
                footers: [],
                values: {
                  backgroundColor: '#f4f4f4',
                  backgroundImage: {
                    url: '',
                    fullWidth: true,
                    repeat: false,
                    center: true,
                    cover: false
                  },
                  contentWidth: '600px',
                  contentAlign: 'center',
                  fontFamily: {
                    label: 'Arial',
                    value: 'arial,helvetica,sans-serif'
                  },
                  preheaderText: '',
                  linkStyle: {
                    body: true,
                    linkColor: '#0000ee',
                    linkHoverColor: '#0000ee',
                    linkUnderline: true,
                    linkHoverUnderline: true
                  },
                  _meta: {
                    htmlID: 'u_body',
                    htmlClassNames: 'u_body'
                  }
                }
              },
              schemaVersion: 8
            };
            try {
              window.unlayer.loadDesign(blankDesign);
              console.log('[UnlayerWrapper] Blank design loaded');
            } catch (err) {
              console.error('[UnlayerWrapper] Error loading blank design:', err);
            }
          }
        });

        window.unlayer.addEventListener('design:updated', () => {
          console.log('[UnlayerWrapper] Design updated');
        });

      } catch (err) {
        console.error('[UnlayerWrapper] Initialization error:', err);
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

  // Watch for design changes
  useEffect(() => {
    if (editorRef.current && initialDesign && !isLoading) {
      console.log('[UnlayerWrapper] Design prop changed, reloading...');
      try {
        editorRef.current.loadDesign(initialDesign);
      } catch (err) {
        console.error('[UnlayerWrapper] Error reloading design:', err);
      }
    }
  }, [initialDesign, isLoading]);

  const handleExport = () => {
    if (!editorRef.current) return;

    editorRef.current.exportHtml((data: any) => {
      const { design, html } = data;
      console.log('[UnlayerWrapper] Exported:', { design, html });
      
      if (onSave) {
        onSave(design, html);
      }
    });
  };

  const handleSaveDesign = () => {
    if (!editorRef.current) return;

    editorRef.current.saveDesign((design: any) => {
      console.log('[UnlayerWrapper] Design saved:', design);
      handleExport();
    });
  };

  return (
    <div className="relative h-full">
      {/* Editor container */}
      <div 
        id="unlayer-editor" 
        style={{ 
          height: '600px',
          width: '100%',
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

      {/* Toolbar (only show when loaded) */}
      {!isLoading && !error && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={handleSaveDesign}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
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