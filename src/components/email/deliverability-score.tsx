'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  EmailDeliverabilityAnalyzer, 
  DeliverabilityScore, 
  DeliverabilityIssue 
} from '@/lib/email/deliverability-analyzer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  Info
} from 'lucide-react';

interface DeliverabilityScoreComponentProps {
  html: string;
  plainText: string;
  subject: string;
  fromEmail?: string;
  fromName?: string;
  onScoreChange?: (score: number, grade: string) => void;
  autoCheck?: boolean;
  className?: string;
}

export function DeliverabilityScoreComponent({
  html,
  plainText,
  subject,
  fromEmail,
  fromName,
  onScoreChange,
  autoCheck = true,
  className = ''
}: DeliverabilityScoreComponentProps) {
  const [analyzer] = useState(() => new EmailDeliverabilityAnalyzer());
  const [score, setScore] = useState<DeliverabilityScore | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const analyzeEmail = useCallback(() => {
    setIsAnalyzing(true);
    
    try {
      const result = analyzer.analyzeEmail(
        html,
        plainText,
        subject,
        fromEmail,
        fromName
      );
      
      setScore(result);
      onScoreChange?.(result.score, result.grade);
    } catch (error) {
      console.error('Error analyzing email:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [html, plainText, subject, fromEmail, fromName, analyzer, onScoreChange]);

  // Auto-analyze with debounce
  useEffect(() => {
    if (!autoCheck) return;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      if (html || subject) {
        analyzeEmail();
      }
    }, 1000);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [html, plainText, subject, fromEmail, fromName, autoCheck]);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (score: number): string => {
    if (score >= 90) return 'bg-green-600';
    if (score >= 80) return 'bg-blue-600';
    if (score >= 70) return 'bg-yellow-600';
    if (score >= 60) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const getIssueIcon = (type: DeliverabilityIssue['type']) => {
    switch (type) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'suggestion':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const groupIssuesByCategory = (issues: DeliverabilityIssue[]) => {
    const grouped: Record<string, DeliverabilityIssue[]> = {};
    
    issues.forEach(issue => {
      if (!grouped[issue.category]) {
        grouped[issue.category] = [];
      }
      grouped[issue.category].push(issue);
    });

    return grouped;
  };

  if (!score && !isAnalyzing) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              Click to analyze email deliverability
            </p>
            <Button onClick={analyzeEmail} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Analyze Email
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Analyzing email...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!score) return null;

  const recommendations = analyzer.getRecommendations(score);
  const groupedIssues = groupIssuesByCategory(score.issues);
  const criticalCount = score.issues.filter(i => i.type === 'critical').length;
  const warningCount = score.issues.filter(i => i.type === 'warning').length;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Deliverability Score</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Score Display */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`text-3xl font-bold ${getScoreColor(score.score)}`}>
                {score.score}%
              </div>
              <Badge className={getGradeColor(score.grade)} variant="secondary">
                Grade {score.grade}
              </Badge>
            </div>
            
            {score.passesThreshold ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <Progress 
              value={score.score} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Issue Summary */}
          {(criticalCount > 0 || warningCount > 0) && (
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              {criticalCount > 0 && (
                <div className="flex items-center space-x-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">{criticalCount} Critical</span>
                </div>
              )}
              {warningCount > 0 && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{warningCount} Warnings</span>
                </div>
              )}
            </div>
          )}

          {/* Threshold Warning */}
          {!score.passesThreshold && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Below Minimum Threshold
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Score must be at least 70% to ensure good deliverability
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expanded Details */}
          {isExpanded && (
            <div className="space-y-4 pt-4 border-t">
              {/* Issues by Category */}
              {Object.entries(groupedIssues).map(([category, issues]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">{category}</h4>
                  <div className="space-y-1">
                    {issues.map((issue, index) => (
                      <div 
                        key={index}
                        className="flex items-start space-x-2 p-2 bg-gray-50 rounded"
                      >
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <p className="text-sm">{issue.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Impact: -{issue.impact} points
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700">
                    Recommendations
                  </h4>
                  <div className="space-y-2">
                    {recommendations.map((rec, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        {rec}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Recheck Button */}
              <div className="pt-4 border-t">
                <Button 
                  onClick={analyzeEmail}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-analyze Email
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}