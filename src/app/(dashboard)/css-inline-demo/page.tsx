'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Copy, Download } from 'lucide-react';
import { inlineCSS } from '@/lib/email/export-simple';
import { EnhancedEmailExportService, inliningStrategies } from '@/lib/email/export-options';
import { Alert, AlertDescription } from '@/components/ui/alert';

const sampleEmailHTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #3498db;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #27ae60;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    }
    .footer {
      background-color: #34495e;
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 14px;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
      }
      .content {
        padding: 20px !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Our Newsletter</h1>
    </div>
    <div class="content">
      <h2>Hello {{first_name}},</h2>
      <p>Thank you for subscribing to our newsletter. We're excited to share our latest updates with you!</p>
      <p>Click the button below to visit our website:</p>
      <a href="https://example.com" class="button">Visit Website</a>
    </div>
    <div class="footer">
      <p>&copy; 2024 Your Company. All rights reserved.</p>
      <p>You received this email because you subscribed to our newsletter.</p>
    </div>
  </div>
</body>
</html>`;

export default function CSSInlineDemoPage() {
  const [activeStrategy, setActiveStrategy] = useState<keyof typeof inliningStrategies>('standard');
  const [processedHtml, setProcessedHtml] = useState('');
  const [validation, setValidation] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  const processEmail = async () => {
    // Analyze the HTML
    const analysisResult = EnhancedEmailExportService.analyzeAndRecommend(sampleEmailHTML);
    setAnalysis(analysisResult);

    // Process with selected strategy
    const processed = await EnhancedEmailExportService.exportWithStrategy(sampleEmailHTML, activeStrategy);
    setProcessedHtml(processed);

    // Validate the result
    const validationResult = EnhancedEmailExportService.validateInlinedHTML(processed);
    setValidation(validationResult);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(processedHtml);
    alert('Copied to clipboard!');
  };

  const downloadHtml = () => {
    const blob = new Blob([processedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-${activeStrategy}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">CSS Inlining Demo</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Original HTML */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Original HTML (with CSS in style tags)</h2>
          <Card className="p-4">
            <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
              <code>{sampleEmailHTML}</code>
            </pre>
          </Card>
        </div>

        {/* Right side - Processed HTML */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Processed HTML (with inline CSS)</h2>
          
          {/* Strategy Selection */}
          <Tabs value={activeStrategy} onValueChange={(value) => setActiveStrategy(value as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="aggressive">Aggressive</TabsTrigger>
              <TabsTrigger value="mobileFriendly">Mobile</TabsTrigger>
              <TabsTrigger value="outlook">Outlook</TabsTrigger>
              <TabsTrigger value="gmail">Gmail</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={processEmail} className="mb-4 w-full">
            Process Email with {activeStrategy} Strategy
          </Button>

          {/* Analysis Results */}
          {analysis && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommended Strategy: {analysis.recommended}</strong>
                <ul className="mt-2 text-sm">
                  {analysis.reasons.map((reason: string, idx: number) => (
                    <li key={idx}>• {reason}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Results */}
          {validation && (
            <>
              {validation.errors.length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Errors:</strong>
                    <ul className="mt-1 text-sm">
                      {validation.errors.map((error: string, idx: number) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {validation.warnings.length > 0 && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warnings:</strong>
                    <ul className="mt-1 text-sm">
                      {validation.warnings.map((warning: string, idx: number) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {validation.isValid && validation.warnings.length === 0 && (
                <Alert className="mb-4 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Email is valid and ready for sending!
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Processed HTML */}
          {processedHtml && (
            <>
              <div className="flex gap-2 mb-4">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={downloadHtml} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
              <Card className="p-4">
                <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                  <code>{processedHtml}</code>
                </pre>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Visual Preview */}
      {processedHtml && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Visual Preview</h2>
          <Card className="p-4">
            <iframe
              srcDoc={processedHtml}
              className="w-full h-96 border rounded"
              title="Email Preview"
            />
          </Card>
        </div>
      )}

      {/* Strategy Descriptions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Strategy Descriptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Standard</h3>
            <p className="text-sm text-muted-foreground">
              Preserves media queries and responsive design. Best for modern email clients like Gmail and Apple Mail.
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Aggressive</h3>
            <p className="text-sm text-muted-foreground">
              Maximum compatibility. Removes all CSS classes and media queries. Best for legacy email clients.
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Mobile Friendly</h3>
            <p className="text-sm text-muted-foreground">
              Optimized for mobile viewing. Keeps only essential media queries for responsive emails.
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Outlook</h3>
            <p className="text-sm text-muted-foreground">
              Optimized for Microsoft Outlook. No media queries or animations, uses table-based layouts.
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Gmail</h3>
            <p className="text-sm text-muted-foreground">
              Optimized for Gmail with support for most CSS features and media queries.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}