'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, AlertCircle, CheckCircle } from 'lucide-react';
import { inliningStrategies, EnhancedEmailExportService } from '@/lib/email/export-options';

interface ExportDialogProps {
  html: string;
  onExport: (strategy: keyof typeof inliningStrategies) => void;
  trigger?: React.ReactNode;
}

export function ExportDialog({ html, onExport, trigger }: ExportDialogProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<keyof typeof inliningStrategies>('standard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{ recommended: string; reasons: string[] } | null>(null);
  const [validation, setValidation] = useState<{ isValid: boolean; warnings: string[]; errors: string[] } | null>(null);

  const analyzeEmail = async () => {
    setIsAnalyzing(true);
    try {
      // Analyze HTML
      const result = EnhancedEmailExportService.analyzeAndRecommend(html);
      setAnalysis(result);
      setSelectedStrategy(result.recommended);

      // Validate with selected strategy
      const processedHtml = await EnhancedEmailExportService.exportWithStrategy(html, result.recommended);
      const validationResult = EnhancedEmailExportService.validateInlinedHTML(processedHtml);
      setValidation(validationResult);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const strategies = [
    {
      value: 'standard',
      label: 'Standard (Recommended)',
      description: 'Preserves media queries and responsive design. Works with most email clients.',
    },
    {
      value: 'aggressive',
      label: 'Aggressive',
      description: 'Maximum compatibility. Removes all CSS classes and media queries.',
    },
    {
      value: 'mobileFriendly',
      label: 'Mobile Optimized',
      description: 'Keeps only mobile-related media queries for responsive emails.',
    },
    {
      value: 'outlook',
      label: 'Outlook Optimized',
      description: 'Optimized for Microsoft Outlook. No media queries or animations.',
    },
    {
      value: 'gmail',
      label: 'Gmail Optimized',
      description: 'Optimized for Gmail with support for most CSS features.',
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Options
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Email Template</DialogTitle>
          <DialogDescription>
            Choose the CSS inlining strategy based on your target email clients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Analysis Button */}
          <div>
            <Button
              onClick={analyzeEmail}
              variant="secondary"
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Email & Get Recommendation'}
            </Button>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommended: {analysis.recommended}</strong>
                <ul className="mt-2 text-sm space-y-1">
                  {analysis.reasons.map((reason, idx) => (
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
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Errors found:</strong>
                    <ul className="mt-2 text-sm space-y-1">
                      {validation.errors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {validation.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warnings:</strong>
                    <ul className="mt-2 text-sm space-y-1">
                      {validation.warnings.map((warning, idx) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {validation.isValid && validation.warnings.length === 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Email is valid and ready for sending!
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Strategy Selection */}
          <div className="space-y-3">
            <Label>Select Export Strategy</Label>
            <RadioGroup value={selectedStrategy} onValueChange={(value) => setSelectedStrategy(value as any)}>
              {strategies.map((strategy) => (
                <div key={strategy.value} className="flex items-start space-x-3 py-2">
                  <RadioGroupItem value={strategy.value} id={strategy.value} className="mt-1" />
                  <Label htmlFor={strategy.value} className="flex-1 cursor-pointer">
                    <div className="font-medium">{strategy.label}</div>
                    <div className="text-sm text-muted-foreground">{strategy.description}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Export Button */}
          <Button
            onClick={() => onExport(selectedStrategy)}
            className="w-full"
          >
            Export with {selectedStrategy} Strategy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}