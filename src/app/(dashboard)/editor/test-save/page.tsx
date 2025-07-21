'use client';

import { useState } from 'react';

export default function TestSavePage() {
  const [showButton, setShowButton] = useState(true);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Save Button Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showButton}
              onChange={(e) => setShowButton(e.target.checked)}
            />
            Show Save Button
          </label>
        </div>
        
        <div className="border-2 border-gray-300 p-4 rounded relative h-96">
          <p>Editor area (placeholder)</p>
          
          {/* Test 1: Basic button */}
          {showButton && (
            <button className="absolute bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded">
              Test Save 1 (absolute)
            </button>
          )}
          
          {/* Test 2: Fixed button */}
          {showButton && (
            <div 
              style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                zIndex: 1000
              }}
            >
              <button className="px-4 py-2 bg-green-600 text-white rounded shadow-lg">
                Test Save 2 (fixed)
              </button>
            </div>
          )}
          
          {/* Test 3: Using the exact same structure */}
          {showButton && (
            <div 
              className="editor-toolbar-save"
              style={{
                position: 'fixed',
                bottom: '30px',
                right: '200px',
                zIndex: 1000
              }}
            >
              <button
                onClick={() => alert('Save clicked!')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 shadow-lg"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Template (exact copy)
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold">Debug Info:</h2>
          <p>Show button state: {showButton ? 'true' : 'false'}</p>
          <p>If buttons are not visible, check browser console for errors</p>
        </div>
      </div>
    </div>
  );
}