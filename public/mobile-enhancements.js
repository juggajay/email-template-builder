// Mobile enhancements for Unlayer editor
(function() {
  console.log('[MobileEnhancements] Initializing...');
  
  function enhanceMobileExperience() {
    const iframe = document.querySelector('#unlayer-editor-fixed iframe, #unlayer-editor iframe');
    if (!iframe) {
      setTimeout(enhanceMobileExperience, 1000);
      return;
    }
    
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      // Add mobile-specific styles
      const style = iframeDoc.createElement('style');
      style.textContent = `
        /* Touch-friendly sizes */
        @media (max-width: 768px) {
          /* Larger touch targets */
          .u-tool-item,
          .tool-item,
          [class*="tool"] {
            min-width: 60px !important;
            min-height: 60px !important;
            padding: 10px !important;
          }
          
          /* Bigger icons */
          .u-tool-icon,
          .tool-icon,
          [class*="icon"] {
            width: 32px !important;
            height: 32px !important;
          }
          
          /* Better spacing */
          .u-tool-label,
          .tool-label {
            font-size: 11px !important;
            margin-top: 4px !important;
          }
          
          /* Improved drag handles */
          .drag-handle,
          .move-handle,
          .u-row-move {
            width: 44px !important;
            height: 44px !important;
            background: rgba(59, 130, 246, 0.1) !important;
            border: 2px solid #3b82f6 !important;
            border-radius: 8px !important;
          }
          
          /* Better tap feedback */
          .u-tool-item:active,
          .tool-item:active {
            transform: scale(0.95);
            opacity: 0.8;
          }
          
          /* Smoother scrolling */
          * {
            -webkit-overflow-scrolling: touch !important;
          }
          
          /* Hide desktop-only features */
          .desktop-only {
            display: none !important;
          }
        }
        
        /* Prevent zoom on input focus (iOS) */
        input, textarea, select {
          font-size: 16px !important;
        }
      `;
      
      if (iframeDoc.head) {
        iframeDoc.head.appendChild(style);
        console.log('[MobileEnhancements] Styles applied');
      }
      
      // Add touch event enhancements
      const enhanceTouchEvents = () => {
        // Find all draggable elements
        const draggables = iframeDoc.querySelectorAll('[draggable="true"]');
        
        draggables.forEach(element => {
          // Add touch event support
          let touchItem = null;
          let touchOffset = { x: 0, y: 0 };
          
          element.addEventListener('touchstart', (e) => {
            touchItem = element;
            const touch = e.touches[0];
            const rect = element.getBoundingClientRect();
            touchOffset.x = touch.clientX - rect.left;
            touchOffset.y = touch.clientY - rect.top;
            
            // Visual feedback
            element.style.opacity = '0.8';
            element.style.transform = 'scale(1.05)';
          }, { passive: true });
          
          element.addEventListener('touchend', () => {
            if (touchItem) {
              touchItem.style.opacity = '';
              touchItem.style.transform = '';
              touchItem = null;
            }
          });
          
          element.addEventListener('touchmove', (e) => {
            if (!touchItem) return;
            
            const touch = e.touches[0];
            const elementBelow = iframeDoc.elementFromPoint(
              touch.clientX - touchOffset.x,
              touch.clientY - touchOffset.y
            );
            
            // Handle drop zones
            if (elementBelow && elementBelow.classList.contains('u-row')) {
              elementBelow.style.outline = '2px dashed #3b82f6';
            }
          }, { passive: true });
        });
      };
      
      // Apply enhancements
      enhanceTouchEvents();
      
      // Monitor for new elements
      const observer = new MutationObserver(() => {
        enhanceTouchEvents();
      });
      
      observer.observe(iframeDoc.body, {
        childList: true,
        subtree: true
      });
      
      // Add viewport meta tag for better mobile rendering
      if (!iframeDoc.querySelector('meta[name="viewport"]')) {
        const viewport = iframeDoc.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        iframeDoc.head.appendChild(viewport);
      }
      
      console.log('[MobileEnhancements] Touch enhancements applied');
      
    } catch (e) {
      console.error('[MobileEnhancements] Error:', e);
      setTimeout(enhanceMobileExperience, 2000);
    }
  }
  
  // Detect mobile and apply enhancements
  if (window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    setTimeout(enhanceMobileExperience, 2000);
  }
  
  // Prevent pinch zoom on editor
  document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
  });
  
  // Improve scrolling performance
  if ('ontouchstart' in window) {
    document.body.style.webkitOverflowScrolling = 'touch';
  }
})();