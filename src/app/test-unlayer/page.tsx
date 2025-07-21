'use client';

import { useEffect } from 'react';

export default function TestUnlayerPage() {
  useEffect(() => {
    // Create container
    const container = document.getElementById('test-container');
    if (!container) return;

    // Load Unlayer script
    const script = document.createElement('script');
    script.src = 'https://editor.unlayer.com/embed.js';
    script.onload = () => {
      console.log('Script loaded, initializing Unlayer...');
      
      // Wait a bit for the script to fully initialize
      setTimeout(() => {
        if ((window as any).unlayer) {
          try {
            (window as any).unlayer.init({
              id: 'test-container',
              displayMode: 'email'
            });

            (window as any).unlayer.addEventListener('editor:ready', () => {
              console.log('Editor is ready!');
              
              // Try loading a basic design
              const basicDesign = {
                body: {
                  rows: [{
                    cells: [1],
                    columns: [{
                      contents: [{
                        type: 'text',
                        values: {
                          text: '<p>Drag and drop blocks here!</p>'
                        }
                      }]
                    }]
                  }]
                }
              };
              
              (window as any).unlayer.loadDesign(basicDesign);
            });

            (window as any).unlayer.addEventListener('design:updated', () => {
              console.log('Design was updated!');
            });

          } catch (error) {
            console.error('Error initializing Unlayer:', error);
          }
        } else {
          console.error('Unlayer object not found');
        }
      }, 500);
    };

    script.onerror = () => {
      console.error('Failed to load Unlayer script');
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Unlayer Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open browser console (F12)</li>
            <li>Wait for "Editor is ready!" message</li>
            <li>Try dragging blocks from the left sidebar</li>
            <li>Check console for "Design was updated!" messages</li>
          </ol>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div 
            id="test-container" 
            style={{ 
              width: '100%', 
              height: '600px',
              minHeight: '600px'
            }}
          />
        </div>

        <div className="mt-4 bg-blue-100 border-l-4 border-blue-500 p-4">
          <p className="font-semibold">Debug Commands (run in console):</p>
          <code className="block mt-2 bg-white p-2 rounded text-sm">
            {`// Get current design
window.unlayer.saveDesign(function(design) { console.log(design); });

// Export HTML
window.unlayer.exportHtml(function(data) { console.log(data.html); });`}
          </code>
        </div>
      </div>
    </div>
  );
}