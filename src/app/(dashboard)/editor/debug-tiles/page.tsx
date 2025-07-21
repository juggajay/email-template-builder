'use client';

import { useEffect, useState } from 'react';

export default function DebugTilesPage() {
  const [editorInfo, setEditorInfo] = useState<any>({
    loaded: false,
    tools: [],
    features: {},
    performance: {}
  });

  useEffect(() => {
    const checkEditor = setInterval(() => {
      if ((window as any).unlayer) {
        const unlayer = (window as any).unlayer;
        
        // Get configuration info
        const info = {
          loaded: true,
          version: unlayer.version || 'unknown',
          tools: [],
          features: {},
          performance: {
            loadTime: (window as any).unlayerLoadTime || 'not measured'
          }
        };

        // Try to get tools list
        if (unlayer.getTools) {
          info.tools = unlayer.getTools();
        }

        // Try to get features
        if (unlayer.getFeatures) {
          info.features = unlayer.getFeatures();
        }

        setEditorInfo(info);
        clearInterval(checkEditor);
      }
    }, 1000);

    return () => clearInterval(checkEditor);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Editor Debug Information</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Editor Status</h2>
          <div className="space-y-2">
            <p>Loaded: <span className={editorInfo.loaded ? 'text-green-600' : 'text-red-600'}>
              {editorInfo.loaded ? 'Yes' : 'No'}
            </span></p>
            <p>Version: {editorInfo.version}</p>
            <p>Load Time: {editorInfo.performance.loadTime}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Expected Tools</h2>
          <div className="grid grid-cols-2 gap-4">
            {['text', 'image', 'button', 'divider', 'spacer', 'social', 'html', 'columns'].map(tool => (
              <div key={tool} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${
                  editorInfo.tools.includes(tool) ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span className="capitalize">{tool}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Test Tiles Visibility</h2>
          <iframe 
            src="/editor" 
            className="w-full h-96 border border-gray-300 rounded"
            title="Editor Preview"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Raw Editor Info</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(editorInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}