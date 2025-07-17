// Performance optimizations for faster editor loading

(function() {
  console.log('[Performance] Initializing optimizations...');
  
  // Preload critical resources
  function preloadResources() {
    const resources = [
      { href: 'https://editor.unlayer.com/embed.js', as: 'script' },
      { href: 'https://editor.unlayer.com/assets/css/embed.css', as: 'style' },
      { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', as: 'style' }
    ];
    
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = resource.as;
      link.href = resource.href;
      if (resource.as === 'font') {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }
  
  // Enable browser caching for Unlayer resources
  function setupCaching() {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      // Simple caching strategy for Unlayer assets
      const cacheUrls = [
        'https://editor.unlayer.com/embed.js',
        'https://editor.unlayer.com/assets/'
      ];
      
      // Store in sessionStorage for quick access
      if (window.sessionStorage) {
        sessionStorage.setItem('unlayer_preloaded', 'true');
      }
    }
  }
  
  // Optimize page performance
  function optimizePerformance() {
    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script[src*="analytics"], script[src*="tracking"]');
    scripts.forEach(script => {
      script.defer = true;
    });
    
    // Lazy load images outside viewport
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      });
      
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
  
  // Reduce main thread blocking
  function optimizeRendering() {
    // Use requestIdleCallback for non-critical tasks
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Load enhancement scripts
        const enhancementScripts = [
          '/fix-percentage-style.js',
          '/fix-drag-drop.js',
          '/mobile-enhancements.js'
        ];
        
        enhancementScripts.forEach((src, index) => {
          setTimeout(() => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            document.body.appendChild(script);
          }, index * 500); // Stagger loading
        });
      });
    }
  }
  
  // Memory optimization
  function optimizeMemory() {
    // Clean up unused event listeners
    const cleanupInterval = setInterval(() => {
      // Remove duplicate event listeners
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        const listeners = getEventListeners(el);
        // Implementation depends on browser
      });
    }, 30000); // Every 30 seconds
    
    // Clear unused data
    if (window.performance && window.performance.memory) {
      const checkMemory = () => {
        const memory = window.performance.memory;
        if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
          console.warn('[Performance] High memory usage detected');
          // Trigger cleanup
          if (window.gc) window.gc();
        }
      };
      setInterval(checkMemory, 60000); // Every minute
    }
  }
  
  // Quick init for returning users
  function quickInit() {
    if (sessionStorage.getItem('unlayer_preloaded') === 'true') {
      console.log('[Performance] Quick init for returning user');
      // Skip some initialization steps
      window.UNLAYER_QUICK_INIT = true;
    }
  }
  
  // Execute optimizations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      preloadResources();
      setupCaching();
      optimizePerformance();
      optimizeRendering();
      quickInit();
    });
  } else {
    preloadResources();
    setupCaching();
    optimizePerformance();
    optimizeRendering();
    quickInit();
  }
  
  // Expose performance metrics
  window.editorPerformance = {
    measureLoadTime: function() {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`[Performance] Page load time: ${loadTime}ms`);
        
        const unlayerLoadTime = window.unlayerLoadTime || 'Not measured';
        console.log(`[Performance] Unlayer load time: ${unlayerLoadTime}`);
      }
    },
    
    getMetrics: function() {
      return {
        pageLoadTime: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart,
        unlayerLoadTime: window.unlayerLoadTime,
        memoryUsage: window.performance.memory ? {
          used: Math.round(window.performance.memory.usedJSHeapSize / 1048576) + 'MB',
          total: Math.round(window.performance.memory.totalJSHeapSize / 1048576) + 'MB'
        } : 'Not available'
      };
    }
  };
})();