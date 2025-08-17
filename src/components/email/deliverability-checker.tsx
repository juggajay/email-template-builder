'use client';

import { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Mail,
  Shield,
  Zap,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DeliverabilityOptimizer } from '@/lib/email/deliverability-optimizer';
import { toast } from 'sonner';

interface DeliverabilityCheckerProps {
  html: string;
  onOptimize?: (optimizedHtml: string) => void;
}

export function DeliverabilityChecker({ html, onOptimize }: DeliverabilityCheckerProps) {
  const [validation, setValidation] = useState<{
    isValid: boolean;
    warnings: string[];
    errors: string[];
    score: number;
  } | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const checkDeliverability = () => {
    const result = DeliverabilityOptimizer.validateEmail(html);
    setValidation(result);
    
    // Calculate deliverability score
    const baseScore = 100;
    const errorPenalty = result.errors.length * 15;
    const warningPenalty = result.warnings.length * 5;
    const calculatedScore = Math.max(0, baseScore - errorPenalty - warningPenalty);
    setScore(calculatedScore);
    
    if (calculatedScore >= 80) {
      toast.success(`Good deliverability score: ${calculatedScore}/100`);
    } else if (calculatedScore >= 60) {
      toast.warning(`Fair deliverability score: ${calculatedScore}/100`);
    } else {
      toast.error(`Poor deliverability score: ${calculatedScore}/100`);
    }
  };

  const optimizeEmail = async () => {
    setIsOptimizing(true);
    
    try {
      const optimizationResult = await DeliverabilityOptimizer.optimizeForDeliverability(html);
      const optimizedHtml = optimizationResult.html;
      
      // Re-validate after optimization
      const newValidation = DeliverabilityOptimizer.validateEmail(optimizedHtml);
      setValidation(newValidation);
      
      // Calculate new score
      const baseScore = 100;
      const errorPenalty = newValidation.errors.length * 15;
      const warningPenalty = newValidation.warnings.length * 5;
      const newScore = Math.max(0, baseScore - errorPenalty - warningPenalty);
      setScore(newScore);
      
      if (onOptimize) {
        onOptimize(optimizedHtml);
      }
      
      toast.success('Email optimized for deliverability!');
    } catch (error) {
      toast.error('Failed to optimize email');
      console.error('Optimization error:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Email Deliverability Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={checkDeliverability}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Check Deliverability
          </Button>
          
          <Button
            onClick={optimizeEmail}
            disabled={isOptimizing}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {isOptimizing ? 'Optimizing...' : 'Optimize Email'}
          </Button>
        </div>

        {score !== null && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Deliverability Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}/100
              </p>
            </div>
            <Badge className={getScoreBadge(score)}>
              {score >= 80 ? 'Excellent' : score >= 60 ? 'Fair' : 'Needs Work'}
            </Badge>
          </div>
        )}

        {validation && (
          <div className="space-y-3">
            {/* Errors */}
            {validation.errors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Critical Issues ({validation.errors.length})
                </h4>
                <div className="space-y-1">
                  {validation.errors.map((error, index) => (
                    <Alert key={index} className="py-2 border-red-200 bg-red-50">
                      <AlertDescription className="text-sm text-red-800">
                        {error}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  Warnings ({validation.warnings.length})
                </h4>
                <div className="space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <Alert key={index} className="py-2 border-yellow-200 bg-yellow-50">
                      <AlertDescription className="text-sm text-yellow-800">
                        {warning}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Success */}
            {validation.isValid && validation.warnings.length === 0 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Email passes all deliverability checks!
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Tips */}
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription className="text-sm">
            <strong>Pro Tips:</strong>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Keep HTML under 100KB for better deliverability</li>
              <li>• Always include an unsubscribe link</li>
              <li>• Use alt text for all images</li>
              <li>• Avoid spam trigger words like "free" or "urgent"</li>
              <li>• Test across multiple email clients</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}