'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import './editor-styles.css';

declare global {
  interface Window {
    unlayer: any;
    unlayerPromise?: Promise<void>;
  }
}

// Polyfill for requestIdleCallback
if (typeof window !== 'undefined' && !(window as any).requestIdleCallback) {
  (window as any).requestIdleCallback = function(callback: () => void, options?: { timeout: number }) {
    const start = Date.now();
    return setTimeout(function() {
      callback();
    }, Math.max(0, (options?.timeout || 50) - (Date.now() - start)));
  };
}

interface UnlayerWrapperFastProps {
  initialDesign?: any;
  onReady?: () => void;
  onDesignLoad?: () => void;
  onSave?: (design: any, html: string) => void;
}

// Cache Unlayer script loading promise
let unlayerLoadPromise: Promise<void> | null = null;

// Preload critical resources
if (typeof window !== 'undefined') {
  // Start preloading immediately when module loads
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'script';
  preloadLink.href = 'https://editor.unlayer.com/embed.js';
  document.head.appendChild(preloadLink);
}

export function UnlayerWrapperFast({ 
  initialDesign, 
  onReady, 
  onDesignLoad,
  onSave 
}: UnlayerWrapperFastProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const initRef = useRef(false);

  // Preload Unlayer script as early as possible
  const preloadUnlayer = useCallback(() => {
    if (unlayerLoadPromise) return unlayerLoadPromise;
    
    if (window.unlayer) {
      unlayerLoadPromise = Promise.resolve();
      return unlayerLoadPromise;
    }

    unlayerLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://editor.unlayer.com/embed.js';
      script.async = true;
      script.defer = false; // Load immediately, don't defer
      
      // Add preload hint
      const preload = document.createElement('link');
      preload.rel = 'preload';
      preload.as = 'script';
      preload.href = 'https://editor.unlayer.com/embed.js';
      document.head.appendChild(preload);

      script.onload = () => {
        setLoadingProgress(50);
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Unlayer script'));
      };

      document.head.appendChild(script);
    });

    return unlayerLoadPromise;
  }, []);

  const initializeEditor = useCallback(async () => {
    if (initRef.current) return;
    initRef.current = true;

    const container = document.getElementById('unlayer-editor-fast');
    if (!container) {
      setError('Container not found');
      setIsLoading(false);
      return;
    }

    try {
      setLoadingProgress(60);
      
      // Check if mobile for optimized config
      const isMobile = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Minimal config for faster loading
      const config = {
        id: 'unlayer-editor-fast',
        displayMode: 'email',
        appearance: {
          theme: 'modern_light',
          panels: {
            tools: {
              dock: isMobile ? 'bottom' : 'left'
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
        // Load only essential features initially
        features: {
          stockImages: false, // Load on demand
          undoRedo: true,
          preview: true,
          export: true,
          userUploads: true,
          imageEditor: true,
          backgroundImage: true,
          colorPicker: true,
          gradients: true,
          linkPicker: true,
          blocks: {
            enabled: true
          },
          // Enable drag and drop repositioning
          dragDrop: true,
          rowMove: true,
          columnMove: true,
          contentMove: true,
          textEditor: {
            tables: true,
            emojis: false // Load on demand
          }
        },
        // Enable all essential tools
        tools: {
          text: { enabled: true },
          image: { enabled: true },
          button: { enabled: true },
          divider: { enabled: true },
          spacer: { enabled: true },
          social: { enabled: true },
          html: { enabled: true },
          columns: { enabled: true },
          // Disable only truly non-essential tools
          form: { enabled: false },
          video: { enabled: false },
          timer: { enabled: false },
          menu: { enabled: false }
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
        // Performance optimizations
        performance: {
          lazyLoad: true,
          throttleResize: true,
          debounceTyping: true
        },
        // Reduce initial load by disabling some features
        projectId: null, // Skip project loading
        customCSS: [], // Don't load custom CSS initially
        customJS: [] // Don't load custom JS initially
      };

      setLoadingProgress(70);
      window.unlayer.init(config);

      // Set up event listeners
      const handleReady = () => {
        setLoadingProgress(90);
        setIsLoading(false);
        editorRef.current = window.unlayer;
        
        // Enable additional features after initial load
        (window as any).requestIdleCallback(() => {
          if (window.unlayer.enableFeature) {
            window.unlayer.enableFeature('stockImages');
            window.unlayer.enableFeature('emojis');
            window.unlayer.enableFeature('forms');
            window.unlayer.enableFeature('video');
          }
        }, { timeout: 2000 });
        
        if (onReady) onReady();

        // Load design
        if (initialDesign) {
          try {
            window.unlayer.loadDesign(initialDesign);
            if (onDesignLoad) onDesignLoad();
          } catch (err) {
            console.error('Error loading design:', err);
          }
        } else {
          // Load minimal blank template
          window.unlayer.loadBlank();
        }
        
        setLoadingProgress(100);
      };

      window.unlayer.addEventListener('editor:ready', handleReady);
      
      // Load fix scripts after editor is ready
      window.unlayer.addEventListener('editor:ready', () => {
        // Load style fix script
        const styleScript = document.createElement('script');
        styleScript.src = '/fix-percentage-style.js';
        styleScript.async = true;
        document.body.appendChild(styleScript);
        
        // Load drag-drop fix script
        const dragScript = document.createElement('script');
        dragScript.src = '/fix-drag-drop.js';
        dragScript.async = true;
        document.body.appendChild(dragScript);
      });

      // Cleanup
      return () => {
        window.unlayer.removeEventListener('editor:ready', handleReady);
      };
    } catch (err) {
      console.error('Initialization error:', err);
      setError('Failed to initialize editor');
      setIsLoading(false);
    }
  }, [initialDesign, onReady, onDesignLoad]);

  useEffect(() => {
    let mounted = true;

    const loadEditor = async () => {
      try {
        setLoadingProgress(10);
        
        // Start loading Unlayer immediately
        await preloadUnlayer();
        
        if (!mounted) return;
        
        setLoadingProgress(30);
        
        // Use requestAnimationFrame instead of setTimeout for better performance
        await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));
        
        if (!mounted) return;
        
        await initializeEditor();
      } catch (err) {
        console.error('Failed to load editor:', err);
        if (mounted) {
          setError('Failed to load email editor');
          setIsLoading(false);
        }
      }
    };

    loadEditor();

    return () => {
      mounted = false;
    };
  }, [preloadUnlayer, initializeEditor]);

  const handleExport = useCallback(() => {
    if (!editorRef.current) return;

    editorRef.current.exportHtml((data: any) => {
      const { design, html } = data;
      if (onSave) {
        onSave(design, html);
      }
    });
  }, [onSave]);

  const handleSaveDesign = useCallback(() => {
    if (!editorRef.current) return;

    editorRef.current.saveDesign((design: any) => {
      handleExport();
    });
  }, [handleExport]);

  // Start preloading immediately on component mount
  useEffect(() => {
    // Preload unlayer and measure time
    const startTime = performance.now();
    preloadUnlayer().then(() => {
      const loadTime = performance.now() - startTime;
      (window as any).unlayerLoadTime = `${Math.round(loadTime)}ms`;
      console.log(`[UnlayerFast] Script loaded in ${Math.round(loadTime)}ms`);
    });
  }, [preloadUnlayer]);

  return (
    <div className="relative h-full unlayer-editor-wrapper">
      {/* Editor container */}
      <div 
        id="unlayer-editor-fast" 
        style={{ 
          height: 'calc(100vh - 200px)',
          minHeight: '600px',
          maxHeight: '900px',
          width: '100%',
          display: isLoading ? 'none' : 'block',
          backgroundColor: '#f5f5f5'
        }} 
      />

      {/* Enhanced loading state with progress */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white editor-loading">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto"></div>
              <div 
                className="absolute inset-0 rounded-full border-4 border-blue-600 mx-auto"
                style={{
                  clipPath: `polygon(0 0, ${loadingProgress}% 0, ${loadingProgress}% 100%, 0 100%)`,
                  animation: 'none',
                  transition: 'clip-path 0.3s ease-out'
                }}
              ></div>
            </div>
            <p className="text-gray-600 mt-4">Loading email editor...</p>
            <p className="text-sm text-gray-500 mt-1">{loadingProgress}%</p>
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
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      {!isLoading && !error && (
        <div className="editor-toolbar-save">
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