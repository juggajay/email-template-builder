// Fix for white-on-white percentage text in Unlayer
(function() {
  let retryCount = 0;
  const maxRetries = 3;
  
  function fixPercentageStyles() {
    // Stop if we've tried too many times
    if (retryCount >= maxRetries) {
      console.log('[PercentageFix] Stopped after max retries');
      return;
    }
    
    const iframe = document.querySelector('#unlayer-editor-fixed iframe, #unlayer-editor iframe, #simple-unlayer-editor iframe');
    if (!iframe) {
      retryCount++;
      setTimeout(fixPercentageStyles, 500);
      return;
    }
    
    try {
      // This will throw an error if cross-origin
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      // Create style element
      const style = iframeDoc.createElement('style');
      style.textContent = `
        /* Fix white-on-white percentage text */
        .blockbuilder-layer-selector,
        .blockbuilder-layer-selector span,
        [class*="percentage"],
        [class*="percent"],
        .u-percentage,
        .percentage-text,
        .column-percentage {
          color: #333 !important;
          opacity: 1 !important;
        }
        
        /* Fix any element with white text on white background */
        [style*="color: white"],
        [style*="color:#fff"],
        [style*="color: #fff"],
        [style*="color:white"] {
          color: #333 !important;
        }
        
        /* Ensure column width indicators are visible */
        .column-width-indicator,
        .width-indicator,
        .size-indicator {
          background-color: rgba(0, 0, 0, 0.8) !important;
          color: white !important;
          padding: 2px 6px !important;
          border-radius: 3px !important;
        }
      `;
      
      // Append to iframe head
      if (iframeDoc.head) {
        iframeDoc.head.appendChild(style);
        console.log('Percentage styles fixed');
      }
    } catch (e) {
      if (e.name === 'SecurityError') {
        console.log('[PercentageFix] Cannot access cross-origin iframe. Stopping.');
        return; // Don't retry for cross-origin errors
      }
      console.error('Error fixing percentage styles:', e);
      retryCount++;
      // Only retry if not a security error
      setTimeout(fixPercentageStyles, 1000);
    }
  }
  
  // Start fixing after a delay
  setTimeout(fixPercentageStyles, 2000);
})();