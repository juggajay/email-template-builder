// Debug script for Unlayer editor
// This will help us understand what's happening with drag and drop

window.debugUnlayer = {
  checkAvailableBlocks: function() {
    console.log('=== Checking Available Blocks ===');
    
    // Get the iframe
    const iframe = document.querySelector('#unlayer-editor iframe');
    if (!iframe) {
      console.error('No iframe found!');
      return;
    }
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    // Check for block panels
    const blockPanels = iframeDoc.querySelectorAll('[data-group-id]');
    console.log(`Found ${blockPanels.length} block groups`);
    
    blockPanels.forEach(panel => {
      const groupId = panel.getAttribute('data-group-id');
      const blocks = panel.querySelectorAll('[draggable="true"]');
      console.log(`Group "${groupId}": ${blocks.length} blocks`);
      
      blocks.forEach(block => {
        const blockName = block.textContent.trim();
        const blockType = block.getAttribute('data-block-type');
        console.log(`  - ${blockName} (type: ${blockType})`);
      });
    });
    
    // Check for specific structure blocks
    const structureBlocks = iframeDoc.querySelectorAll('[data-structure]');
    console.log(`\nFound ${structureBlocks.length} structure blocks`);
    
    structureBlocks.forEach(block => {
      const structure = block.getAttribute('data-structure');
      console.log(`  - Structure: ${structure}`);
    });
  },
  
  checkDropZones: function() {
    console.log('=== Checking Drop Zones ===');
    
    const iframe = document.querySelector('#unlayer-editor iframe');
    if (!iframe) {
      console.error('No iframe found!');
      return;
    }
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    // Check for drop zones
    const dropZones = iframeDoc.querySelectorAll('.u_row, .u_column, .drop-zone, [data-droppable="true"]');
    console.log(`Found ${dropZones.length} drop zones`);
    
    dropZones.forEach((zone, index) => {
      console.log(`Drop zone ${index + 1}:`, {
        class: zone.className,
        id: zone.id,
        tag: zone.tagName
      });
    });
  },
  
  testDragAndDrop: function() {
    console.log('=== Testing Drag and Drop ===');
    
    const iframe = document.querySelector('#unlayer-editor iframe');
    if (!iframe) {
      console.error('No iframe found!');
      return;
    }
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    // Find a draggable block
    const draggableBlock = iframeDoc.querySelector('[draggable="true"]');
    if (!draggableBlock) {
      console.error('No draggable block found!');
      return;
    }
    
    console.log('Found draggable block:', draggableBlock.textContent.trim());
    
    // Find a drop zone
    const dropZone = iframeDoc.querySelector('.u_row, .u_column');
    if (!dropZone) {
      console.error('No drop zone found!');
      return;
    }
    
    console.log('Found drop zone:', dropZone.className);
    
    // Simulate drag start
    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
      dataTransfer: new DataTransfer()
    });
    
    draggableBlock.dispatchEvent(dragStartEvent);
    console.log('Dispatched dragstart event');
    
    // Simulate drag over
    const dragOverEvent = new DragEvent('dragover', {
      bubbles: true,
      cancelable: true,
      dataTransfer: dragStartEvent.dataTransfer
    });
    
    dropZone.dispatchEvent(dragOverEvent);
    console.log('Dispatched dragover event');
    
    // Simulate drop
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer: dragStartEvent.dataTransfer
    });
    
    dropZone.dispatchEvent(dropEvent);
    console.log('Dispatched drop event');
  },
  
  getEditorState: function() {
    if (window.unlayer) {
      window.unlayer.saveDesign((design) => {
        console.log('Current design state:', design);
      });
    } else {
      console.error('Unlayer not found!');
    }
  },
  
  runAllTests: function() {
    this.checkAvailableBlocks();
    this.checkDropZones();
    this.getEditorState();
    console.log('\nTo test drag and drop manually, run: debugUnlayer.testDragAndDrop()');
  }
};

// Auto-run tests after a delay to ensure editor is loaded
setTimeout(() => {
  console.log('Running Unlayer debug tests...');
  window.debugUnlayer.runAllTests();
}, 3000);