'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { UnlayerWrapperFast } from './unlayer-wrapper-fast';
import './mobile-styles.css';

interface MobileEditorWrapperProps {
  initialDesign?: any;
  onSave?: (design: any, html: string) => void;
  templateName: string;
  onTemplateNameChange: (name: string) => void;
}

export function MobileEditorWrapper({
  initialDesign,
  onSave,
  templateName,
  onTemplateNameChange
}: MobileEditorWrapperProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSave = async (design: any, html: string) => {
    if (onSave) {
      await onSave(design, html);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  };

  const handleExport = () => {
    // Trigger export from the editor
    const unlayer = (window as any).unlayer;
    if (unlayer) {
      unlayer.exportHtml((data: any) => {
        const { html } = data;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}.html`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  const handlePreview = () => {
    const unlayer = (window as any).unlayer;
    if (unlayer) {
      unlayer.exportHtml((data: any) => {
        const { html } = data;
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
          previewWindow.document.write(html);
          previewWindow.document.close();
        }
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0 editor-header">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/templates')}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-800 lg:hidden"
            aria-label="Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <input
            type="text"
            value={templateName}
            onChange={(e) => onTemplateNameChange(e.target.value)}
            className="flex-1 text-center lg:text-left text-lg font-medium border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-2 template-name-input"
            placeholder="Template name"
          />
          
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 -mr-2 text-gray-600 hover:text-gray-800 lg:hidden"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={() => router.push('/templates')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Back to Templates
            </button>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 overflow-hidden editor-main-content">
        <div className="h-full editor-container">
          <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden relative editor-wrapper">
            <UnlayerWrapperFast
              initialDesign={initialDesign}
              onReady={() => console.log('[MobileEditor] Ready')}
              onDesignLoad={() => console.log('[MobileEditor] Design loaded')}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="mobile-nav">
          <button onClick={handlePreview} className="text-gray-600 hover:text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Preview</span>
          </button>
          
          <button onClick={handleExport} className="text-gray-600 hover:text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export</span>
          </button>
          
          <button onClick={() => router.push('/templates')} className="text-gray-600 hover:text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Templates</span>
          </button>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <>
          <div 
            className="mobile-menu-overlay"
            onClick={() => setShowMenu(false)}
          />
          <div className="mobile-menu open">
            <div className="swipe-indicator" />
            
            <h3 className="text-lg font-semibold mb-4">Menu</h3>
            
            <button
              onClick={() => {
                handlePreview();
                setShowMenu(false);
              }}
              className="mobile-button flex items-center justify-start bg-gray-100 hover:bg-gray-200"
            >
              <svg className="button-icon-mobile" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview Template
            </button>
            
            <button
              onClick={() => {
                handleExport();
                setShowMenu(false);
              }}
              className="mobile-button flex items-center justify-start bg-gray-100 hover:bg-gray-200"
            >
              <svg className="button-icon-mobile" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export HTML
            </button>
            
            <button
              onClick={() => {
                router.push('/templates');
                setShowMenu(false);
              }}
              className="mobile-button flex items-center justify-start bg-gray-100 hover:bg-gray-200"
            >
              <svg className="button-icon-mobile" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Back to Templates
            </button>
            
            <button
              onClick={() => setShowMenu(false)}
              className="mobile-button mt-4 bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Save Success Toast */}
      {showSaveSuccess && (
        <div className="fixed bottom-20 left-4 right-4 lg:left-auto lg:right-4 lg:w-auto bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center animate-fade-in">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Template saved successfully!
        </div>
      )}
      
      {/* Load mobile enhancements */}
      <Script src="/mobile-enhancements.js" strategy="afterInteractive" />
    </div>
  );
}