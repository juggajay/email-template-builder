// Script to inspect Unlayer tiles and understand why columns work but others don't

window.inspectUnlayerTiles = function() {
  console.log('=== Inspecting Unlayer Tiles ===');
  
  // Get the iframe
  const iframe = document.querySelector('#unlayer-editor iframe, #simple-unlayer-editor iframe, #test-container iframe');
  if (!iframe) {
    console.error('No Unlayer iframe found!');
    return;
  }
  
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  
  // Find all draggable elements
  const draggables = iframeDoc.querySelectorAll('[draggable="true"]');
  console.log(`Found ${draggables.length} draggable elements`);
  
  // Analyze each draggable
  const tileInfo = [];
  draggables.forEach((elem, index) => {
    const info = {
      index: index,
      text: elem.textContent.trim(),
      tagName: elem.tagName,
      classList: Array.from(elem.classList),
      attributes: {},
      styles: {},
      parent: {
        tagName: elem.parentElement?.tagName,
        classList: elem.parentElement ? Array.from(elem.parentElement.classList) : []
      }
    };
    
    // Get all attributes
    for (let attr of elem.attributes) {
      info.attributes[attr.name] = attr.value;
    }
    
    // Get computed styles
    const styles = window.getComputedStyle(elem);
    info.styles = {
      cursor: styles.cursor,
      userSelect: styles.userSelect,
      pointerEvents: styles.pointerEvents,
      position: styles.position,
      display: styles.display
    };
    
    // Check for data attributes
    for (let key in elem.dataset) {
      info.attributes[`data-${key}`] = elem.dataset[key];
    }
    
    tileInfo.push(info);
  });
  
  // Group by type
  const columns = tileInfo.filter(t => t.text.toLowerCase().includes('column'));
  const others = tileInfo.filter(t => !t.text.toLowerCase().includes('column'));
  
  console.log('\n=== COLUMNS TILES (Working) ===');
  console.table(columns);
  
  console.log('\n=== OTHER TILES (Not Working) ===');
  console.table(others);
  
  // Find differences
  if (columns.length > 0 && others.length > 0) {
    console.log('\n=== KEY DIFFERENCES ===');
    const columnsSample = columns[0];
    const othersSample = others[0];
    
    // Compare attributes
    console.log('Columns attributes:', columnsSample.attributes);
    console.log('Others attributes:', othersSample.attributes);
    
    // Find unique attributes in columns
    const uniqueToColumns = Object.keys(columnsSample.attributes).filter(
      key => !Object.keys(othersSample.attributes).includes(key)
    );
    
    const uniqueToOthers = Object.keys(othersSample.attributes).filter(
      key => !Object.keys(columnsSample.attributes).includes(key)
    );
    
    if (uniqueToColumns.length > 0) {
      console.log('Attributes unique to COLUMNS:', uniqueToColumns);
    }
    
    if (uniqueToOthers.length > 0) {
      console.log('Attributes unique to OTHERS:', uniqueToOthers);
    }
  }
  
  // Check event listeners
  console.log('\n=== CHECKING EVENT LISTENERS ===');
  
  // Try to find what makes columns special
  const firstColumn = Array.from(draggables).find(el => el.textContent.includes('Column'));
  const firstOther = Array.from(draggables).find(el => el.textContent.includes('Text') || el.textContent.includes('Image'));
  
  if (firstColumn) {
    console.log('Column element:', {
      html: firstColumn.outerHTML,
      parent: firstColumn.parentElement?.outerHTML
    });
  }
  
  if (firstOther) {
    console.log('Other element (Text/Image):', {
      html: firstOther.outerHTML,
      parent: firstOther.parentElement?.outerHTML
    });
  }
  
  return {
    columns: columns,
    others: others,
    draggables: tileInfo
  };
};

// Also create a function to test drag events
window.testDragEvents = function() {
  const iframe = document.querySelector('#unlayer-editor iframe, #simple-unlayer-editor iframe, #test-container iframe');
  if (!iframe) {
    console.error('No iframe found!');
    return;
  }
  
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  
  // Find a column tile and a text tile
  const columnTile = Array.from(iframeDoc.querySelectorAll('[draggable="true"]')).find(el => el.textContent.includes('Column'));
  const textTile = Array.from(iframeDoc.querySelectorAll('[draggable="true"]')).find(el => el.textContent.includes('Text'));
  
  if (columnTile) {
    console.log('Testing drag events on Column tile...');
    
    // Add event listeners
    columnTile.addEventListener('dragstart', (e) => {
      console.log('Column dragstart:', e);
      console.log('DataTransfer:', e.dataTransfer);
    });
    
    columnTile.addEventListener('drag', (e) => {
      console.log('Column drag');
    });
    
    columnTile.addEventListener('dragend', (e) => {
      console.log('Column dragend:', e);
    });
  }
  
  if (textTile) {
    console.log('Testing drag events on Text tile...');
    
    // Add event listeners
    textTile.addEventListener('dragstart', (e) => {
      console.log('Text dragstart:', e);
      console.log('DataTransfer:', e.dataTransfer);
    });
    
    textTile.addEventListener('drag', (e) => {
      console.log('Text drag');
    });
    
    textTile.addEventListener('dragend', (e) => {
      console.log('Text dragend:', e);
    });
  }
  
  console.log('Event listeners added. Try dragging the tiles now.');
};

// Check for structures vs blocks
window.checkStructuresVsBlocks = function() {
  const iframe = document.querySelector('#unlayer-editor iframe, #simple-unlayer-editor iframe, #test-container iframe');
  if (!iframe) return;
  
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  
  // Look for structure elements
  const structures = iframeDoc.querySelectorAll('[data-structure], .structure, [class*="structure"]');
  const blocks = iframeDoc.querySelectorAll('[data-block], .block, [class*="block"]:not([class*="structure"])');
  
  console.log('=== STRUCTURES vs BLOCKS ===');
  console.log(`Found ${structures.length} structures`);
  console.log(`Found ${blocks.length} blocks`);
  
  // Columns are likely structures, not blocks
  console.log('\nStructures (likely includes columns):');
  structures.forEach(s => {
    console.log('- ' + s.textContent.trim().substring(0, 50));
  });
  
  console.log('\nBlocks (likely text, image, etc):');
  blocks.forEach(b => {
    console.log('- ' + b.textContent.trim().substring(0, 50));
  });
};

// Auto-run after a delay
setTimeout(() => {
  console.log('Running Unlayer tile inspection...');
  window.inspectUnlayerTiles();
  window.checkStructuresVsBlocks();
}, 3000);