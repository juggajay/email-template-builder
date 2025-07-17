// Fix drag and drop for items in the editor canvas
(function() {
  console.log('[DragDropFix] Initializing drag-drop fix...');
  
  let retryCount = 0;
  const maxRetries = 3;
  
  function enableDragAndDrop() {
    if (retryCount >= maxRetries) {
      console.log('[DragDropFix] Stopped after max retries');
      return;
    }
    
    const iframe = document.querySelector('#unlayer-editor-fixed iframe, #unlayer-editor iframe');
    if (!iframe) {
      console.log('[DragDropFix] No iframe found, retrying...');
      retryCount++;
      setTimeout(enableDragAndDrop, 1000);
      return;
    }
    
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const iframeWin = iframe.contentWindow;
      
      // Check if Unlayer is available in iframe
      if (iframeWin && iframeWin.unlayer) {
        console.log('[DragDropFix] Found Unlayer in iframe');
        
        // Enable drag and drop features
        if (iframeWin.unlayer.setOption) {
          iframeWin.unlayer.setOption('allowDragDrop', true);
          iframeWin.unlayer.setOption('allowRowDragDrop', true);
          iframeWin.unlayer.setOption('allowContentDragDrop', true);
          console.log('[DragDropFix] Enabled drag options via setOption');
        }
      }
      
      // Find draggable elements in the canvas
      const draggableElements = iframeDoc.querySelectorAll(
        '.u-row, .u-column, .u-block, [draggable="true"], .moveable, .draggable'
      );
      
      console.log(`[DragDropFix] Found ${draggableElements.length} potentially draggable elements`);
      
      // Ensure drag handles are visible and functional
      const style = iframeDoc.createElement('style');
      style.textContent = `
        /* Ensure drag handles are visible */
        .drag-handle,
        .move-handle,
        .u-row-move,
        .u-block-move,
        [class*="drag-"],
        [class*="move-"] {
          cursor: move !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }
        
        /* Make draggable elements more obvious on hover */
        .u-row:hover,
        .u-column:hover,
        .u-block:hover {
          outline: 2px dashed #3182ce;
          outline-offset: 2px;
        }
        
        /* Ensure drag handles show on hover */
        .u-row:hover .u-row-move,
        .u-block:hover .u-block-move,
        .u-column:hover .u-column-move {
          opacity: 1 !important;
          display: block !important;
        }
        
        /* Fix for drag placeholder */
        .u-row-placeholder,
        .drag-placeholder {
          border: 2px dashed #3182ce !important;
          background-color: rgba(49, 130, 206, 0.1) !important;
          min-height: 50px !important;
        }
      `;
      
      if (iframeDoc.head) {
        iframeDoc.head.appendChild(style);
        console.log('[DragDropFix] Added drag-drop styles');
      }
      
      // Look for Unlayer's internal drag configuration
      const checkDragConfig = () => {
        // Check for drag handles
        const dragHandles = iframeDoc.querySelectorAll(
          '.u-row-move, .u-block-move, .u-column-move, .drag-handle'
        );
        
        if (dragHandles.length > 0) {
          console.log(`[DragDropFix] Found ${dragHandles.length} drag handles`);
          
          // Make sure they're interactive
          dragHandles.forEach(handle => {
            handle.style.cursor = 'move';
            handle.style.pointerEvents = 'auto';
            
            // Add event listeners if not already present
            if (!handle.hasAttribute('data-drag-fixed')) {
              handle.setAttribute('data-drag-fixed', 'true');
              
              handle.addEventListener('mouseenter', () => {
                handle.style.opacity = '1';
              });
              
              handle.addEventListener('mouseleave', () => {
                handle.style.opacity = '0.7';
              });
            }
          });
        } else {
          console.log('[DragDropFix] No drag handles found yet');
        }
      };
      
      // Check initially and after a delay
      checkDragConfig();
      setTimeout(checkDragConfig, 2000);
      
      // Monitor for new elements
      const observer = new MutationObserver((mutations) => {
        let hasNewElements = false;
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length > 0) {
            hasNewElements = true;
          }
        });
        
        if (hasNewElements) {
          checkDragConfig();
        }
      });
      
      // Start observing
      observer.observe(iframeDoc.body, {
        childList: true,
        subtree: true
      });
      
      console.log('[DragDropFix] Drag-drop fix applied');
      
    } catch (e) {
      if (e.name === 'SecurityError') {
        console.log('[DragDropFix] Cannot access cross-origin iframe. Stopping.');
        return; // Don't retry for cross-origin errors
      }
      console.error('[DragDropFix] Error:', e);
      retryCount++;
      setTimeout(enableDragAndDrop, 2000);
    }
  }
  
  // Start after a delay to ensure editor is ready
  setTimeout(enableDragAndDrop, 3000);
  
  // Also provide a manual function to check drag status
  window.checkDragDropStatus = function() {
    const iframe = document.querySelector('#unlayer-editor-fixed iframe, #unlayer-editor iframe');
    if (!iframe) {
      console.log('No iframe found');
      return;
    }
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const iframeWin = iframe.contentWindow;
    
    console.log('=== Drag-Drop Status ===');
    
    // Check Unlayer options
    if (iframeWin && iframeWin.unlayer) {
      console.log('Unlayer available in iframe:', true);
      
      if (iframeWin.unlayer.getOption) {
        console.log('allowDragDrop:', iframeWin.unlayer.getOption('allowDragDrop'));
        console.log('allowRowDragDrop:', iframeWin.unlayer.getOption('allowRowDragDrop'));
      }
    }
    
    // Check for drag handles
    const dragHandles = iframeDoc.querySelectorAll('.u-row-move, .u-block-move, .drag-handle');
    console.log('Drag handles found:', dragHandles.length);
    
    // Check for draggable elements
    const draggables = iframeDoc.querySelectorAll('[draggable="true"]');
    console.log('Draggable elements:', draggables.length);
    
    // Check for rows and blocks
    const rows = iframeDoc.querySelectorAll('.u-row');
    const blocks = iframeDoc.querySelectorAll('.u-block');
    console.log('Rows:', rows.length, 'Blocks:', blocks.length);
  };
})();