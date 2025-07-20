'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { mergeTags } from '@/lib/merge-tags';
import { registerShopifyBlocks, hasShopifyConnection, loadShopifyProducts } from '@/lib/editor/shopify-blocks';
import { MinimalistSidebar } from './minimalist-sidebar';
import { ZebCharacter } from '@/components/brand/ZebCharacter';
import { debounce } from '@/lib/utils';
import styles from './minimalist-styles.module.css';

declare global {
  interface Window {
    unlayer: any;
  }
}

interface UnlayerWrapperMinimalistProps {
  initialDesign?: any;
  onReady?: () => void;
  onDesignLoad?: () => void;
  onSave?: (design: any, html: string) => void;
}

export function UnlayerWrapperMinimalist({ 
  initialDesign, 
  onReady, 
  onDesignLoad,
  onSave 
}: UnlayerWrapperMinimalistProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(() => {
      if (editorRef.current && onSave) {
        setIsSaving(true);
        editorRef.current.exportHtml((data: any) => {
          const { design, html } = data;
          onSave(design, html);
          setTimeout(() => setIsSaving(false), 500);
        });
      }
    }, 500),
    [onSave]
  );

  useEffect(() => {
    let mounted = true;
    let script: HTMLScriptElement | null = null;

    const loadUnlayer = async () => {
      // Check if already loaded
      if (window.unlayer) {
        initializeEditor();
        return;
      }

      script = document.createElement('script');
      script.src = 'https://editor.unlayer.com/embed.js';
      script.async = true;

      script.onload = () => {
        if (mounted) {
          setTimeout(initializeEditor, 100);
        }
      };

      script.onerror = () => {
        if (mounted) {
          setError('Failed to load email editor');
          setIsLoading(false);
        }
      };

      document.head.appendChild(script);
    };

    const initializeEditor = () => {
      if (!window.unlayer || !containerRef.current) {
        setError('Editor not available');
        setIsLoading(false);
        return;
      }

      try {
        const isMobile = window.innerWidth <= 1024;
        
        window.unlayer.init({
          id: 'unlayer-editor-minimalist',
          displayMode: 'email',
          appearance: {
            theme: 'modern_light',
            panels: {
              tools: {
                dock: 'left',
                collapsible: false
              },
              properties: {
                dock: 'right',
                collapsible: true,
                open: false // Start with properties panel closed
              }
            }
          },
          features: {
            stockImages: true,
            undoRedo: true,
            preview: true,
            export: true,
            userUploads: true,
            imageEditor: true,
            colorPicker: true,
            gradients: true,
            linkPicker: true
          },
          tools: {
            text: { enabled: true },
            image: { enabled: true },
            button: { enabled: true },
            divider: { enabled: true },
            spacer: { enabled: true },
            html: { enabled: true }
          },
          options: {
            // Hide Unlayer branding
            brandingLogo: false,
            displayConditions: [],
            fonts: {
              showDefaultFonts: true
            }
          },
          mergeTags: mergeTags,
          // Custom CSS to inject
          customCSS: `
            /* Hide Unlayer UI elements */
            .blockbuilder-placeholder { display: none !important; }
            .blockbuilder-wrapper { background: transparent !important; }
            .blockbuilder-content-wrapper { box-shadow: none !important; }
            .u-row-container:hover::before { content: none !important; }
            .add-row-button { display: none !important; }
            .blockbuilder-footer { display: none !important; }
            .blockbuilder-branding { display: none !important; }
            
            /* Minimize hover states */
            .u-row:hover { border-color: #E5E5E5 !important; }
            .selected { outline: 1px solid #00D4AA !important; }
            
            /* Clean canvas background */
            .blockbuilder-content { background: #FFFFFF !important; }
            .email-editor-canvas { background: #FAFAFA !important; }
          `
        });

        window.unlayer.addEventListener('editor:ready', async () => {
          setIsLoading(false);
          editorRef.current = window.unlayer;
          
          // Hide tools panel initially (we'll use our custom sidebar)
          const toolsPanel = document.querySelector('.gjs-pn-panels');
          if (toolsPanel) {
            (toolsPanel as HTMLElement).style.display = 'none';
          }
          
          // Register custom blocks
          try {
            registerShopifyBlocks(window.unlayer);
            const hasShopify = await hasShopifyConnection();
            if (hasShopify) {
              const products = await loadShopifyProducts();
              if (products.length > 0) {
                window.unlayer.updateTool('shopify_product', {
                  options: {
                    product: {
                      options: {
                        productId: {
                          data: { options: products }
                        }
                      }
                    }
                  }
                });
              }
            }
          } catch (error) {
            console.error('Error setting up custom blocks:', error);
          }
          
          if (onReady) onReady();

          // Load design
          if (initialDesign) {
            window.unlayer.loadDesign(initialDesign);
            setIsEmpty(false);
            if (onDesignLoad) onDesignLoad();
          }
        });

        // Track if canvas is empty
        window.unlayer.addEventListener('design:updated', (data: any) => {
          const hasContent = data?.design?.body?.rows?.length > 0;
          setIsEmpty(!hasContent);
        });

        // Auto-collapse sidebar on mobile
        if (isMobile) {
          setSidebarCollapsed(true);
        }

      } catch (err) {
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
  }, [initialDesign, onReady, onDesignLoad]);

  const handleBlockDrop = (blockType: string) => {
    if (editorRef.current) {
      // Trigger block add in Unlayer
      editorRef.current.addRow({
        columns: [{
          contents: [{
            type: blockType,
            values: {}
          }]
        }]
      });
    }
  };

  const handleSave = () => {
    if (editorRef.current && onSave) {
      debouncedSave();
    }
  };

  return (
    <div className={styles.editorContainer} ref={containerRef}>
      {/* Collapsible Sidebar */}
      <MinimalistSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onBlockSelect={handleBlockDrop}
      />

      {/* Main Editor Area */}
      <div 
        className={styles.editorWrapper}
        style={{
          marginLeft: sidebarCollapsed ? '60px' : '280px',
          transition: 'margin-left 300ms ease-in-out'
        }}
      >
        {/* Minimal Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={styles.collapseButton}
              aria-label="Toggle sidebar"
            >
              ≡
            </button>
            <input
              type="text"
              placeholder="Template Name..."
              className={styles.templateNameInput}
              defaultValue=""
            />
          </div>
          
          <div className={styles.headerRight}>
            <button className={styles.headerButton}>Preview</button>
            <button 
              className={`${styles.headerButton} ${styles.primaryButton}`}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button className={styles.headerButton}>Send Test</button>
          </div>
        </div>

        {/* Canvas */}
        <div className={styles.canvasContainer}>
          <div 
            id="unlayer-editor-minimalist"
            className={styles.canvas}
            style={{ display: isLoading ? 'none' : 'block' }}
          />

          {/* Empty State */}
          {!isLoading && isEmpty && (
            <div className={styles.emptyState}>
              <ZebCharacter variant="guide" size="sm" className={styles.emptyZeb} />
              <p className={styles.emptyText}>Drag blocks to start building</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className={styles.loadingState}>
              <div className={styles.loadingSkeleton}>
                <div className={styles.skeletonHeader} />
                <div className={styles.skeletonContent} />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={styles.errorState}>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>
                Reload Page
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Save Indicator */}
      {isSaving && (
        <div className={styles.saveIndicator}>
          Saving...
        </div>
      )}
    </div>
  );
}