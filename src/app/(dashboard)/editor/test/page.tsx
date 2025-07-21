'use client';

import { useEffect, useState, useRef } from 'react';

export default function TestEditorPage() {
  const [status, setStatus] = useState('Initializing...');
  const [logs, setLogs] = useState<string[]>([]);
  const editorRef = useRef<any>(null);
  
  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('Component mounted, starting initialization');
    
    // Check if Unlayer already exists
    if ((window as any).unlayer) {
      addLog('Unlayer already loaded');
      initializeEditor();
      return;
    }
    
    // Load Unlayer script
    const script = document.createElement('script');
    script.src = '//editor.unlayer.com/embed.js';
    
    script.onload = () => {
      addLog('Unlayer script loaded');
      initializeEditor();
    };
    
    script.onerror = (error) => {
      addLog(`Failed to load Unlayer script: ${error}`);
      setStatus('Failed to load editor');
    };
    
    document.head.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  const initializeEditor = () => {
    addLog('Starting editor initialization');
    
    const unlayer = (window as any).unlayer;
    if (!unlayer) {
      addLog('Unlayer not found on window');
      setStatus('Editor not available');
      return;
    }
    
    try {
      setStatus('Initializing editor...');
      
      unlayer.init({
        id: 'test-email-editor',
        displayMode: 'email',
        appearance: {
          theme: 'light'
        }
      });
      
      unlayer.addEventListener('editor:ready', () => {
        addLog('Editor ready event fired');
        setStatus('Editor ready!');
        
        // Load a simple test design
        const testDesign = {
          body: {
            rows: [{
              cells: [1],
              columns: [{
                contents: [{
                  type: 'text',
                  values: {
                    containerPadding: '10px',
                    text: '<h1>Test Template Loaded!</h1><p>If you can see this, the editor is working correctly.</p>'
                  }
                }]
              }]
            }]
          }
        };
        
        unlayer.loadDesign(testDesign);
        addLog('Test design loaded');
      });
      
      unlayer.addEventListener('editor:error', (error: any) => {
        addLog(`Editor error: ${JSON.stringify(error)}`);
        setStatus('Editor error');
      });
      
      editorRef.current = unlayer;
      
    } catch (error) {
      addLog(`Error during initialization: ${error}`);
      setStatus('Initialization failed');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Unlayer Editor Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Status: {status}</h2>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Debug Logs:</h3>
            <div className="bg-gray-100 rounded p-2 h-32 overflow-y-auto text-xs font-mono">
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div id="test-email-editor" style={{ height: '600px', border: '1px solid #ddd' }} />
        </div>
      </div>
    </div>
  );
}