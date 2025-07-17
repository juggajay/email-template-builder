'use client';

import { useEffect, useState } from 'react';

export default function EditorDebugPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Load Unlayer script
    const script = document.createElement('script');
    script.src = 'https://editor.unlayer.com/embed.js';
    script.onload = () => {
      console.log('Unlayer script loaded');
      initializeEditor();
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initializeEditor = () => {
    if (!window.unlayer) {
      console.error('Unlayer not found');
      return;
    }

    try {
      window.unlayer.init({
        id: 'test-editor',
        displayMode: 'email',
        appearance: {
          theme: 'light',
          panels: {
            tools: { dock: 'left' }
          }
        }
      });

      window.unlayer.addEventListener('editor:ready', () => {
        console.log('Editor ready!');
        setIsLoaded(true);
        
        // Get debug info
        const info = {
          hasUnlayer: !!window.unlayer,
          methods: Object.keys(window.unlayer).filter(k => typeof window.unlayer[k] === 'function'),
          ready: true
        };
        setDebugInfo(info);
      });
    } catch (error) {
      console.error('Error initializing editor:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : String(error) });
    }
  };

  const testDragDrop = () => {
    if (!window.unlayer) return;

    // Load a simple design to test
    const testDesign = {
      body: {
        id: 'test',
        rows: [{
          id: 'row-1',
          cells: [1],
          columns: [{
            id: 'col-1',
            contents: [{
              id: 'text-1',
              type: 'text',
              values: {
                text: '<p>Drop blocks here!</p>'
              }
            }]
          }]
        }],
        values: {
          backgroundColor: '#f4f4f4',
          contentWidth: '600px'
        }
      }
    };

    window.unlayer.loadDesign(testDesign);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Editor Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          
          <div className="mt-4 space-x-2">
            <button
              onClick={testDragDrop}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={!isLoaded}
            >
              Load Test Design
            </button>
            
            <button
              onClick={() => {
                if (window.unlayer) {
                  window.unlayer.saveDesign((design: any) => {
                    console.log('Current design:', design);
                    alert('Check console for design');
                  });
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={!isLoaded}
            >
              Get Current Design
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div id="test-editor" style={{ height: '600px', width: '100%' }}>
            {!isLoaded && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Loading editor...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <p className="font-semibold">Testing Instructions:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Wait for the editor to load completely</li>
            <li>Click "Load Test Design" to add a template</li>
            <li>Try dragging blocks from the left sidebar</li>
            <li>Check the browser console for any errors</li>
            <li>Click "Get Current Design" to see the JSON structure</li>
          </ol>
        </div>
      </div>
    </div>
  );
}