// Debug script to understand Unlayer image handling

// 1. Check if images are in the design
async function debugDesign() {
  console.log('=== DEBUGGING UNLAYER IMAGES ===');
  
  // Get the editor instance
  const editor = window.unlayer;
  if (!editor) {
    console.error('No Unlayer instance found');
    return;
  }
  
  // Save current design
  editor.saveDesign((design) => {
    console.log('Current design:', design);
    
    // Check for images in design
    const hasImages = JSON.stringify(design).includes('image');
    console.log('Design contains images:', hasImages);
    
    // Export HTML with different options
    console.log('\n--- Testing export with cleanup: false ---');
    editor.exportHtml({ cleanup: false, minify: false }, (data) => {
      console.log('HTML length:', data.html.length);
      console.log('Contains <img>:', data.html.includes('<img'));
      const imgCount = (data.html.match(/<img/g) || []).length;
      console.log('Image count:', imgCount);
      
      // Find all img tags
      const imgMatches = data.html.match(/<img[^>]*>/g);
      if (imgMatches) {
        console.log('Found img tags:');
        imgMatches.forEach((img, i) => console.log(`  ${i + 1}:`, img));
      }
    });
    
    console.log('\n--- Testing export with cleanup: true ---');
    editor.exportHtml({ cleanup: true, minify: false }, (data) => {
      console.log('HTML length:', data.html.length);
      console.log('Contains <img>:', data.html.includes('<img'));
      const imgCount = (data.html.match(/<img/g) || []).length;
      console.log('Image count:', imgCount);
    });
    
    console.log('\n--- Testing export with NO options ---');
    editor.exportHtml((data) => {
      console.log('HTML length:', data.html.length);
      console.log('Contains <img>:', data.html.includes('<img'));
      const imgCount = (data.html.match(/<img/g) || []).length;
      console.log('Image count:', imgCount);
    });
  });
}

// 2. Check registered callbacks
function checkCallbacks() {
  console.log('\n=== CHECKING CALLBACKS ===');
  // This is internal, but let's try
  if (window.unlayer._callbacks) {
    console.log('Registered callbacks:', Object.keys(window.unlayer._callbacks));
  } else {
    console.log('Cannot access internal callbacks');
  }
}

// 3. Test image upload
function testImageUpload() {
  console.log('\n=== TESTING IMAGE UPLOAD ===');
  console.log('To test: Use the image tool and upload an image');
  console.log('Watch console for "Custom image upload triggered" message');
}

// Run all tests
debugDesign();
checkCallbacks();
testImageUpload();

console.log('\n=== INSTRUCTIONS ===');
console.log('1. Open browser console');
console.log('2. Go to editor page');
console.log('3. Add an image using the image tool');
console.log('4. Open console and paste this script');
console.log('5. Check the output');