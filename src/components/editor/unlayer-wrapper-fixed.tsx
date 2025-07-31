'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import { mergeTags } from '@/lib/merge-tags';
import { registerShopifyBlocks, hasShopifyConnection, loadShopifyProducts } from '@/lib/editor/shopify-blocks';
import { processEmailImages, addImageDimensions } from '@/lib/email/image-processor';
import './editor-styles.css';

declare global {
  interface Window {
    unlayer: any;
  }
}

interface UnlayerWrapperFixedProps {
  initialDesign?: any;
  onReady?: (editor: any) => void;
  onDesignLoad?: () => void;
  onSave?: (design: any, html: string) => void;
  onDesignUpdate?: (design: any, html: string) => void;
  hideBottomSaveButton?: boolean;
}

export function UnlayerWrapperFixed({ 
  initialDesign, 
  onReady, 
  onDesignLoad,
  onSave,
  onDesignUpdate,
  hideBottomSaveButton = false
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
          // Ensure drag and drop is enabled and configure export options
          options: {
            allowDragDrop: true,
            allowRowDragDrop: true,
            allowContentDragDrop: true,
            // Force absolute URLs for all assets
            baseUrl: typeof window !== 'undefined' ? window.location.origin : 'https://app.zebamail.com',
            assetsUrl: typeof window !== 'undefined' ? window.location.origin : 'https://app.zebamail.com'
          },
          // Comprehensive merge tags for e-commerce
          mergeTags: mergeTags,
          validator: {
            enabled: true
          },
          // ZebaMail Branded Styles
          customCSS: `
            /* Remove blue backgrounds and add green theme */
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
            .u-col.selected,
            .u-row-selected,
            .u-col-selected {
              background-color: rgba(16, 185, 129, 0.05) !important;
              outline: 2px solid #10b981 !important;
              outline-offset: -2px;
              box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important;
            }
            
            /* Green add buttons */
            .blockbuilder-row-add,
            .blockbuilder-row-add-button,
            .blockbuilder-add-button,
            button.add-row {
              background-color: #ffffff !important;
              border: 2px solid #e5e7eb !important;
              color: #10b981 !important;
            }
            
            .blockbuilder-row-add:hover,
            .blockbuilder-row-add-button:hover,
            .blockbuilder-add-button:hover,
            button.add-row:hover {
              background-color: #10b981 !important;
              border-color: #10b981 !important;
              color: #ffffff !important;
            }
            
            /* Override blue inline styles */
            [style*="background-color: rgb(51, 130, 206)"],
            [style*="background-color: #3382ce"],
            [style*="background: rgb(51, 130, 206)"],
            [style*="background: #3382ce"] {
              background-color: #10b981 !important;
            }
            
            [style*="border-color: rgb(51, 130, 206)"],
            [style*="border-color: #3382ce"] {
              border-color: #10b981 !important;
            }
            
            /* Tool panel styling */
            .blockbuilder-tools {
              background-color: #ffffff !important;
              border-right: 1px solid #e5e7eb !important;
            }
            
            /* Active tool state */
            .blockbuilder-tool-active,
            .tool-active {
              background-color: #10b981 !important;
              color: #ffffff !important;
            }
            
            /* Row/column resize handles */
            .gjs-resizer-h,
            .gjs-resizer-v,
            .ui-resizable-handle {
              background-color: #10b981 !important;
            }
            
            /* Dropzone indicators */
            .gjs-dropzone,
            .u-row-dropzone,
            .u-col-dropzone {
              border: 2px dashed #10b981 !important;
              background-color: rgba(16, 185, 129, 0.05) !important;
            }
          `,
          customJS: [
            // Inject styles after editor loads
            `
            console.log('[ZebaMail] Applying branded styles...');
            
            // Create and inject style element
            var style = document.createElement('style');
            style.innerHTML = \`
              /* ZebaMail Branded Editor Styles */
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
              
              .u-row.ui-droppable-hover,
              .u-col.ui-droppable-hover {
                background-color: rgba(16, 185, 129, 0.05) !important;
                outline: 2px solid #10b981 !important;
              }
              
              .u-row:hover,
              .u-col:hover {
                outline: 1px solid #10b981 !important;
                background-color: rgba(16, 185, 129, 0.02) !important;
              }
              
              .blockbuilder-layer-selected,
              .u-row.selected,
              .u-col.selected {
                background-color: rgba(16, 185, 129, 0.05) !important;
                outline: 2px solid #10b981 !important;
                box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important;
              }
              
              .blockbuilder-row-add-button,
              .blockbuilder-add-button,
              button[class*="add"] {
                background-color: #ffffff !important;
                border: 2px solid #e5e7eb !important;
                color: #10b981 !important;
              }
              
              .blockbuilder-row-add-button:hover,
              .blockbuilder-add-button:hover,
              button[class*="add"]:hover {
                background-color: #10b981 !important;
                border-color: #10b981 !important;
                color: #ffffff !important;
              }
              
              /* Override any blue colors */
              [style*="rgb(51, 130, 206)"],
              [style*="#3382ce"],
              [style*="rgb(51, 153, 255)"],
              [style*="#3399ff"] {
                background-color: #10b981 !important;
                color: white !important;
              }
            \`;
            document.head.appendChild(style);
            
            // Apply styles periodically to override any dynamic updates
            setInterval(function() {
              var blueElements = document.querySelectorAll('[style*="rgb(51, 130, 206)"], [style*="#3382ce"]');
              blueElements.forEach(function(el) {
                if (el.style.backgroundColor.includes('51, 130, 206') || el.style.backgroundColor.includes('3382ce')) {
                  el.style.backgroundColor = '#10b981';
                }
                if (el.style.borderColor.includes('51, 130, 206') || el.style.borderColor.includes('3382ce')) {
                  el.style.borderColor = '#10b981';
                }
              });
            }, 1000);
            `
          ]
        });

        window.unlayer.addEventListener('editor:ready', async () => {
          console.log('[UnlayerFixed] Editor ready');
          setIsLoading(false);
          editorRef.current = window.unlayer;
          
          // Register custom image upload handler
          window.unlayer.registerCallback('image', function(file: any, done: any) {
            console.log('[UnlayerFixed] Custom image upload triggered:', file);
            
            const data = new FormData();
            data.append('file', file.attachments[0]);
            
            fetch('/api/upload/image', {
              method: 'POST',
              body: data,
              credentials: 'include' // Include cookies for auth
            })
            .then(response => response.json())
            .then(result => {
              if (result.error) {
                console.error('[UnlayerFixed] Upload error:', result.error);
                done({ progress: 100, error: result.error });
              } else {
                console.log('[UnlayerFixed] Upload success:', result.url);
                done({ progress: 100, url: result.url });
              }
            })
            .catch(error => {
              console.error('[UnlayerFixed] Upload failed:', error);
              done({ progress: 100, error: 'Failed to upload image' });
            });
          });
          
          // Create collapsible sidebar functionality
          setTimeout(() => {
            // Create hover trigger zone and indicator
            const hoverZone = document.createElement('div');
            hoverZone.id = 'sidebar-hover-zone';
            hoverZone.style.cssText = `
              position: fixed;
              left: 0;
              top: 60px;
              width: 30px;
              height: calc(100vh - 60px);
              background: transparent;
              z-index: 999;
              cursor: pointer;
            `;
            
            const hoverIndicator = document.createElement('div');
            hoverIndicator.id = 'sidebar-hover-indicator';
            hoverIndicator.style.cssText = `
              position: fixed;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              width: 20px;
              height: 60px;
              background: #00D4AA;
              border-radius: 0 4px 4px 0;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              z-index: 1000;
              box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
              transition: all 0.3s ease;
            `;
            hoverIndicator.innerHTML = '▶';
            
            document.body.appendChild(hoverZone);
            document.body.appendChild(hoverIndicator);
            
            // Apply styles to collapse the Unlayer sidebar
            const style = document.createElement('style');
            style.textContent = `
              #unlayer-editor-fixed {
                transition: padding-left 0.3s ease-in-out !important;
              }
              
              #unlayer-editor-fixed.sidebar-collapsed {
                padding-left: 0 !important;
              }
              
              #unlayer-editor-fixed iframe {
                width: 100% !important;
                height: 100% !important;
              }
              
              /* Override Unlayer's internal styles */
              .blockbuilder-wrapper .blockbuilder-content-frame {
                left: 0 !important;
                width: 100% !important;
              }
            `;
            document.head.appendChild(style);
            
            // Get the editor container
            const editorContainer = document.getElementById('unlayer-editor-fixed');
            if (editorContainer) {
              // Start with sidebar collapsed
              editorContainer.classList.add('sidebar-collapsed');
              
              // Try to hide panels using Unlayer's API
              if (window.unlayer && window.unlayer.setBodyValues) {
                try {
                  // Hide panels through Unlayer's API if available
                  window.unlayer.hidePanel && window.unlayer.hidePanel('tools');
                } catch (e) {
                  console.log('[UnlayerFixed] Could not hide panel via API');
                }
              }
              
              let isHovering = false;
              
              const expandSidebar = () => {
                isHovering = true;
                editorContainer.classList.remove('sidebar-collapsed');
                hoverIndicator.style.opacity = '0';
                
                // Show panels through Unlayer's API if available
                if (window.unlayer && window.unlayer.showPanel) {
                  try {
                    window.unlayer.showPanel('tools');
                  } catch (e) {
                    console.log('[UnlayerFixed] Could not show panel via API');
                  }
                }
              };
              
              const collapseSidebar = () => {
                if (!isHovering) {
                  editorContainer.classList.add('sidebar-collapsed');
                  hoverIndicator.style.opacity = '1';
                  
                  // Hide panels through Unlayer's API if available
                  if (window.unlayer && window.unlayer.hidePanel) {
                    try {
                      window.unlayer.hidePanel('tools');
                    } catch (e) {
                      console.log('[UnlayerFixed] Could not hide panel via API');
                    }
                  }
                }
              };
              
              // Add event listeners
              hoverZone.addEventListener('mouseenter', expandSidebar);
              hoverIndicator.addEventListener('mouseenter', expandSidebar);
              
              hoverZone.addEventListener('mouseleave', () => {
                isHovering = false;
                setTimeout(collapseSidebar, 300);
              });
              
              // Also monitor the iframe for hover
              const checkIframeHover = setInterval(() => {
                const iframe = editorContainer.querySelector('iframe');
                if (iframe) {
                  clearInterval(checkIframeHover);
                  
                  // Monitor mouse position relative to iframe
                  iframe.addEventListener('load', () => {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDoc) {
                      iframeDoc.addEventListener('mousemove', (e: MouseEvent) => {
                        if (e.clientX < 250) { // If mouse is in sidebar area
                          expandSidebar();
                        } else if (e.clientX > 300) { // If mouse moved away from sidebar
                          isHovering = false;
                          setTimeout(collapseSidebar, 300);
                        }
                      });
                    }
                  });
                }
              }, 100);
            }
          }, 1000); // Wait for Unlayer to fully initialize
          
          // Register Shopify blocks with proper error handling
          try {
            let hasShopify = false;
            
            if (window.unlayer && typeof window.unlayer.registerTool === 'function') {
              if (process.env.NODE_ENV === 'development') {
                console.log('[UnlayerFixed] Registering Shopify blocks...');
              }
              registerShopifyBlocks(window.unlayer);
              
              // Check if user has connection and products
              hasShopify = await hasShopifyConnection();
              if (process.env.NODE_ENV === 'development') {
                console.log('[UnlayerFixed] Has Shopify connection:', hasShopify);
              }
            } else {
              console.warn('[UnlayerFixed] Unlayer registerTool method not available, skipping Shopify blocks registration');
            }
            
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
            onReady(window.unlayer);
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
          // Only log in development mode
          if (process.env.NODE_ENV === 'development') {
            console.log('[UnlayerFixed] Design updated');
          }
          // Export HTML on design update
          if (onDesignUpdate) {
            window.unlayer.exportHtml((exportData: any) => {
              onDesignUpdate(exportData.design, exportData.html);
            });
          }
        });

        // Listen for important events only (remove excessive logging)
        if (process.env.NODE_ENV === 'development') {
          window.unlayer.addEventListener('block:drag:start', () => {
            console.log('[UnlayerFixed] Block drag started');
          });

          window.unlayer.addEventListener('block:drag:end', () => {
            console.log('[UnlayerFixed] Block drag ended');
          });
        }

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


  const handleExport = async () => {
    console.log('[UnlayerFixed] handleExport called');
    if (!editorRef.current) {
      console.error('[UnlayerFixed] No editor reference');
      return;
    }

    try {
      console.log('[UnlayerFixed] Calling exportHtml...');
      await new Promise<void>((resolve, reject) => {
        // Export with options to ensure absolute URLs and preserve images
        const exportOptions = {
          cleanup: false, // Don't strip content
          minify: false,
          mergeTags: {} // Empty object to prevent tag replacement
        };
        
        editorRef.current.exportHtml(exportOptions, async (data: any) => {
          try {
            const { design, html } = data;
            
            if (!design || !html) {
              reject(new Error('Invalid export data'));
              return;
            }
            
            // Process HTML to ensure all image URLs are absolute
            const imageProcessingResult = await processEmailImages(html, {
              logDetails: process.env.NODE_ENV === 'development'
            });
            
            // Add image dimensions for better email client support
            let processedHtml = addImageDimensions(imageProcessingResult.html);
            
            console.log('[UnlayerFixed] Exported:', { 
              designSize: JSON.stringify(design).length,
              htmlSize: processedHtml.length,
              imageCount: imageProcessingResult.imageCount,
              processedImages: imageProcessingResult.processedImages.length
            });
            
            if (onSave) {
              console.log('[UnlayerFixed] Calling onSave callback...');
              onSave(design, processedHtml);
            } else {
              console.warn('[UnlayerFixed] No onSave callback provided');
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('[UnlayerFixed] Error in handleExport:', error);
      throw error; // Re-throw to be handled by caller
    }
  };

  const handleSaveDesign = async () => {
    console.log('[UnlayerFixed] Save button clicked');
    if (!editorRef.current) {
      console.error('[UnlayerFixed] No editor reference');
      alert('Editor not ready. Please wait and try again.');
      return;
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[UnlayerFixed] Getting design...');
      }
      
      await new Promise<void>((resolve, reject) => {
        editorRef.current.saveDesign((design: any) => {
          try {
            if (process.env.NODE_ENV === 'development') {
              console.log('[UnlayerFixed] Design obtained:', design);
            }
            handleExport();
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('[UnlayerFixed] Error in handleSaveDesign:', error);
      alert('Failed to save template. Please try again.');
    }
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
      {!isLoading && !error && !hideBottomSaveButton && (
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

// Memoized export with deep comparison for design prop
export default memo(UnlayerWrapperFixed, (prevProps, nextProps) => {
  // Deep compare design objects
  const designEqual = JSON.stringify(prevProps.initialDesign) === JSON.stringify(nextProps.initialDesign);
  
  // Compare other props
  const otherPropsEqual = 
    prevProps.hideBottomSaveButton === nextProps.hideBottomSaveButton;
  
  return designEqual && otherPropsEqual;
});