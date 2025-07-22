'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function TestCSSInlinePage() {
  const [inputHtml, setInputHtml] = useState(`
    <style>
      .header { background-color: #3498db; padding: 20px; }
      .title { color: white; font-size: 24px; }
      .content { padding: 20px; background-color: #f0f0f0; }
    </style>
    <div class="header">
      <h1 class="title">Test Email</h1>
    </div>
    <div class="content">
      <p>This is a test email with CSS that needs to be inlined.</p>
    </div>
  `);
  const [outputHtml, setOutputHtml] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInlineCSS = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: inputHtml,
          format: 'html',
          options: {
            inlineCSS: true,
            preserveMediaQueries: true,
            preserveFontFaces: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to inline CSS');
      }

      const { content } = await response.json();
      setOutputHtml(content);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to inline CSS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Test CSS Inlining</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Input HTML (with CSS)</h2>
          <Textarea
            value={inputHtml}
            onChange={(e) => setInputHtml(e.target.value)}
            className="h-96 font-mono text-sm"
            placeholder="Paste HTML with CSS here..."
          />
          <Button 
            onClick={handleInlineCSS} 
            className="mt-4"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Inline CSS'}
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Output HTML (with inline CSS)</h2>
          <Textarea
            value={outputHtml}
            readOnly
            className="h-96 font-mono text-sm"
            placeholder="Inlined HTML will appear here..."
          />
          {outputHtml && (
            <div className="mt-4 space-y-2">
              <Button 
                onClick={() => navigator.clipboard.writeText(outputHtml)}
                variant="outline"
              >
                Copy to Clipboard
              </Button>
              <p className="text-sm text-muted-foreground">
                Notice how CSS classes are now inline style attributes
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}