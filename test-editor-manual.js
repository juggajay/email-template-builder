// Manual test script to check Unlayer editor functionality
// Run this in the browser console when on the /editor page

function testUnlayerEditor() {
  console.log('=== Testing Unlayer Editor ===');
  
  // Check if Unlayer is loaded
  if (typeof window.unlayer === 'undefined') {
    console.error('❌ Unlayer is not loaded!');
    return;
  }
  
  console.log('✅ Unlayer is loaded');
  
  // Check available methods
  const methods = [
    'init',
    'loadDesign',
    'saveDesign',
    'exportHtml',
    'addEventListener',
    'removeEventListener',
    'setMergeTags',
    'registerCallback',
    'unregisterCallback'
  ];
  
  methods.forEach(method => {
    if (typeof window.unlayer[method] === 'function') {
      console.log(`✅ Method ${method} is available`);
    } else {
      console.error(`❌ Method ${method} is NOT available`);
    }
  });
  
  // Try to get current design
  window.unlayer.saveDesign((design) => {
    console.log('Current design:', design);
    console.log('Number of rows:', design.body?.rows?.length || 0);
  });
  
  // Export current HTML
  window.unlayer.exportHtml((data) => {
    console.log('Exported HTML length:', data.html.length);
    console.log('First 500 chars:', data.html.substring(0, 500));
  });
  
  // Test loading a simple design
  const testDesign = {
    body: {
      id: 'test-body',
      rows: [
        {
          id: 'test-row-1',
          cells: [1],
          columns: [
            {
              id: 'test-col-1',
              contents: [
                {
                  id: 'test-text-1',
                  type: 'text',
                  values: {
                    text: '<p>Test Text Block - If you see this, the editor is working!</p>'
                  }
                }
              ]
            }
          ]
        }
      ],
      values: {
        backgroundColor: '#f4f4f4',
        contentWidth: '600px',
        contentAlign: 'center',
        fontFamily: {
          label: 'Arial',
          value: 'arial,helvetica,sans-serif'
        }
      }
    },
    schemaVersion: 8
  };
  
  console.log('Loading test design...');
  window.unlayer.loadDesign(testDesign);
  
  // Listen for design updates
  const updateHandler = () => {
    console.log('Design was updated!');
  };
  
  window.unlayer.addEventListener('design:updated', updateHandler);
  
  console.log('=== Test Complete ===');
  console.log('Try dragging and dropping elements to see if "Design was updated!" appears in the console.');
  
  return {
    unlayer: window.unlayer,
    testDesign: testDesign
  };
}

// Run the test
testUnlayerEditor();