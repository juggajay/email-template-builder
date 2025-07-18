'use client';

import { useEffect, useRef, useState } from 'react';
import { mergeTags } from '@/lib/merge-tags';
import { registerShopifyBlocks, hasShopifyConnection, loadShopifyProducts } from '@/lib/editor/shopify-blocks';
import './editor-styles.css';

declare global {
  interface Window {
    unlayer: any;
  }
}

interface UnlayerWrapperFixedProps {
  initialDesign?: any;
  onReady?: () => void;
  onDesignLoad?: () => void;
  onSave?: (design: any, html: string) => void;
}

export function UnlayerWrapperFixed({ 
  initialDesign, 
  onReady, 
  onDesignLoad,
  onSave 
}: UnlayerWrapperFixedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  
  // Debug log
  console.log('[UnlayerWrapperFixed] Render state:', { isLoading, error, hasOnSave: !!onSave });

  useEffect(() => {
    let mounted = true;
    let script: HTMLScriptElement | null = null;

    const loadUnlayer = async () => {
      if (window.unlayer) {
        console.log('[UnlayerFixed] Unlayer already loaded');
        initializeEditor();
        return;
      }

      script = document.createElement('script');
      script.src = 'https://editor.unlayer.com/embed.js';
      script.async = true;

      script.onload = () => {
        console.log('[UnlayerFixed] Script loaded');
        if (mounted) {
          // Give it a moment to fully initialize
          setTimeout(initializeEditor, 100);
        }
      };

      script.onerror = () => {
        console.error('[UnlayerFixed] Failed to load script');
        if (mounted) {
          setError('Failed to load email editor');
          setIsLoading(false);
        }
      };

      document.head.appendChild(script);
    };

    const initializeEditor = () => {
      if (!window.unlayer) {
        console.error('[UnlayerFixed] Unlayer not found');
        setError('Editor not available');
        setIsLoading(false);
        return;
      }

      const container = document.getElementById('unlayer-editor-fixed');
      if (!container) {
        console.error('[UnlayerFixed] Container element not found');
        setError('Container not found');
        setIsLoading(false);
        return;
      }

      try {
        console.log('[UnlayerFixed] Initializing Unlayer...');
        
        // Check if mobile
        const isMobile = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        // Initialize with specific configuration that ensures blocks work
        window.unlayer.init({
          id: 'unlayer-editor-fixed',
          displayMode: 'email',
          appearance: {
            theme: 'modern_light',
            panels: {
              tools: {
                dock: 'left',  // Always left, even on desktop
                collapsible: false
              },
              properties: {
                dock: 'right',
                collapsible: true
              }
            }
          },
          // Enable sorting and repositioning
          sortable: true,
          moveable: true,
          // Mobile-specific options
          mobile: {
            enabled: isMobile,
            breakpoint: 768
          },
          features: {
            stockImages: true,
            // Enable all features to ensure nothing is blocked
            undoRedo: true,
            preview: true,
            export: true,
            userUploads: true,
            imageEditor: true,
            backgroundImage: true,
            colorPicker: true,
            gradients: true,
            linkPicker: true,
            // Make sure blocks are enabled
            blocks: {
              enabled: true
            },
            // Enable drag and drop repositioning
            dragDrop: true,
            rowMove: true,
            columnMove: true,
            contentMove: true
          },
          // Ensure all default tools are enabled
          tools: {
            text: { enabled: true },
            image: { enabled: true },
            button: { enabled: true },
            divider: { enabled: true },
            spacer: { enabled: true },
            social: { enabled: true },
            html: { enabled: true },
            video: { enabled: true },
            menu: { enabled: true },
            timer: { enabled: true },
            // Structures
            columns: { enabled: true }
          },
          // Set content restrictions to none
          contentRestrictions: {
            enabled: false
          },
          // Enable editor options for better control
          editor: {
            minRows: 1,
            maxRows: null,
            autoSelectOnDrop: true
          },
          // Ensure drag and drop is enabled
          options: {
            allowDragDrop: true,
            allowRowDragDrop: true,
            allowContentDragDrop: true
          },
          // Comprehensive merge tags for e-commerce
          mergeTags: mergeTags
        });

        window.unlayer.addEventListener('editor:ready', async () => {
          console.log('[UnlayerFixed] Editor ready');
          setIsLoading(false);
          editorRef.current = window.unlayer;
          
          // Register Shopify blocks
          try {
            console.log('[UnlayerFixed] Registering Shopify blocks...');
            registerShopifyBlocks(window.unlayer);
            
            // Check if user has connection and products
            const hasShopify = await hasShopifyConnection();
            console.log('[UnlayerFixed] Has Shopify connection:', hasShopify);
            
            if (hasShopify) {
              // Load products for dropdown
              const products = await loadShopifyProducts();
              console.log('[UnlayerFixed] Loaded products:', products.length);
              
              if (products.length > 0) {
                // Update the product dropdown options
                window.unlayer.updateTool('shopify_product', {
                  options: {
                    product: {
                      options: {
                        productId: {
                          data: {
                            options: products
                          }
                        }
                      }
                    }
                  }
                });
              }
            }
          } catch (error) {
            console.error('[UnlayerFixed] Error setting up Shopify:', error);
          }
          
          if (onReady) {
            onReady();
          }

          // Load initial design or a default template
          if (initialDesign) {
            console.log('[UnlayerFixed] Loading initial design...');
            try {
              window.unlayer.loadDesign(initialDesign);
              console.log('[UnlayerFixed] Design loaded successfully');
              if (onDesignLoad) {
                onDesignLoad();
              }
            } catch (err) {
              console.error('[UnlayerFixed] Error loading design:', err);
            }
          } else {
            // Load a default template that includes both structures and blocks
            const defaultTemplate = {
              body: {
                id: 'default-template',
                rows: [
                  {
                    id: 'row-welcome',
                    cells: [1],
                    columns: [
                      {
                        id: 'column-welcome',
                        contents: [
                          {
                            id: 'heading-welcome',
                            type: 'heading',
                            values: {
                              text: 'Welcome to the Email Editor',
                              level: 'h1',
                              textAlign: 'center'
                            }
                          },
                          {
                            id: 'text-welcome',
                            type: 'text',
                            values: {
                              text: '<p style="text-align: center;">Start building your email by dragging blocks from the left sidebar!</p>'
                            }
                          }
                        ]
                      }
                    ],
                    values: {
                      backgroundColor: '',
                      padding: '10px',
                      columnsBackgroundColor: ''
                    }
                  }
                ],
                values: {
                  backgroundColor: '#f4f4f4',
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
                  }
                }
              },
              schemaVersion: 8
            };
            
            try {
              window.unlayer.loadDesign(defaultTemplate);
              console.log('[UnlayerFixed] Default template loaded');
            } catch (err) {
              console.error('[UnlayerFixed] Error loading default template:', err);
            }
          }
        });

        // Listen for design updates
        window.unlayer.addEventListener('design:updated', (data: any) => {
          console.log('[UnlayerFixed] Design updated', data);
        });

        // Listen for various drag events
        window.unlayer.addEventListener('block:drag:start', (data: any) => {
          console.log('[UnlayerFixed] Block drag started', data);
        });

        window.unlayer.addEventListener('block:drag:end', (data: any) => {
          console.log('[UnlayerFixed] Block drag ended', data);
        });
        
        // Additional event listeners for debugging
        window.unlayer.addEventListener('row:drag:start', (data: any) => {
          console.log('[UnlayerFixed] Row drag started', data);
        });
        
        window.unlayer.addEventListener('row:drag:end', (data: any) => {
          console.log('[UnlayerFixed] Row drag ended', data);
        });
        
        window.unlayer.addEventListener('content:drag:start', (data: any) => {
          console.log('[UnlayerFixed] Content drag started', data);
        });
        
        window.unlayer.addEventListener('content:drag:end', (data: any) => {
          console.log('[UnlayerFixed] Content drag ended', data);
        });

      } catch (err) {
        console.error('[UnlayerFixed] Initialization error:', err);
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

  const handleExport = () => {
    console.log('[UnlayerFixed] handleExport called');
    if (!editorRef.current) {
      console.error('[UnlayerFixed] No editor reference');
      return;
    }

    console.log('[UnlayerFixed] Calling exportHtml...');
    editorRef.current.exportHtml((data: any) => {
      const { design, html } = data;
      console.log('[UnlayerFixed] Exported:', { 
        designSize: JSON.stringify(design).length,
        htmlSize: html.length 
      });
      
      if (onSave) {
        console.log('[UnlayerFixed] Calling onSave callback...');
        onSave(design, html);
      } else {
        console.warn('[UnlayerFixed] No onSave callback provided');
      }
    });
  };

  const handleSaveDesign = () => {
    console.log('[UnlayerFixed] Save button clicked');
    if (!editorRef.current) {
      console.error('[UnlayerFixed] No editor reference');
      alert('Editor not ready. Please wait and try again.');
      return;
    }

    console.log('[UnlayerFixed] Getting design...');
    editorRef.current.saveDesign((design: any) => {
      console.log('[UnlayerFixed] Design obtained:', design);
      handleExport();
    });
  };

  return (
    <div className="relative h-full unlayer-editor-wrapper">
      {/* Editor container */}
      <div 
        id="unlayer-editor-fixed" 
        style={{ 
          height: 'calc(100vh - 200px)',
          minHeight: '600px',
          maxHeight: '900px',
          width: '100%',
          display: isLoading ? 'none' : 'block',
          backgroundColor: '#f5f5f5'
        }} 
      />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white editor-loading">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading email editor...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few seconds...</p>
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
            <p className="text-gray-800 font-medium mb-2">{error}</p>
            <p className="text-sm text-gray-600 mb-4">Please try refreshing the page</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Save button - fixed position */}
      {!isLoading && !error && (
        <div 
          className="editor-toolbar-save"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 1000
          }}
        >
          <button
            onClick={handleSaveDesign}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 shadow-lg"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
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