'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Eye,
  Settings
} from 'lucide-react';
import { PreviewDataEditor } from '../editor/merge-tags-enhanced/preview-data';

interface SendTestEmailProps {
  templateHtml?: string;
  templateSubject?: string;
  onEmailSent?: (result: any) => void;
}

export function SendTestEmail({ 
  templateHtml = '', 
  templateSubject = '',
  onEmailSent 
}: SendTestEmailProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [provider, setProvider] = useState<'resend' | 'sendgrid'>('resend');
  const [subject, setSubject] = useState(templateSubject || 'Test Email - Template Preview');
  const [previewData, setPreviewData] = useState<Record<string, any>>({});
  const [showPreviewData, setShowPreviewData] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    emailId?: string;
  } | null>(null);

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      alert('Please enter a test email address');
      return;
    }

    if (!templateHtml.trim()) {
      alert('No template content to send');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: testEmail,
          html: templateHtml,
          templateData: previewData,
          provider,
          subject
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: 'Test email sent successfully!',
          emailId: data.emailId
        });
        onEmailSent?.(data);
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send test email'
        });
      }

    } catch (error) {
      setResult({
        success: false,
        message: 'Network error - please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (email: string) => {
    setTestEmail(email);
    setResult(null); // Clear previous results when email changes
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Send Test Email
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogDescription>
            Send a test email to preview how your template will look in the inbox
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-email">Test Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={!validateEmail(testEmail) && testEmail ? 'border-red-500' : ''}
                />
                {!validateEmail(testEmail) && testEmail && (
                  <p className="text-sm text-red-500 mt-1">Please enter a valid email address</p>
                )}
              </div>

              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Test Email Subject"
                />
              </div>

              <div>
                <Label htmlFor="provider">Email Provider</Label>
                <Select value={provider} onValueChange={(value: any) => setProvider(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resend">
                      <div className="flex items-center space-x-2">
                        <span>Resend</span>
                        <Badge variant="outline" className="text-xs">Recommended</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Template Preview Data */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Template Data</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreviewData(!showPreviewData)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {showPreviewData ? 'Hide' : 'Configure'} Data
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Configure test data for merge tags in your template
              </p>
            </CardHeader>
            {showPreviewData && (
              <CardContent>
                <PreviewDataEditor
                  onDataChange={setPreviewData}
                  templateContent={templateHtml}
                  initialData={previewData}
                />
              </CardContent>
            )}
          </Card>

          {/* Template Preview */}
          {templateHtml && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Template Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
                  <div 
                    className="bg-white p-4 rounded shadow-sm"
                    dangerouslySetInnerHTML={{ 
                      __html: templateHtml 
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This is a preview of your template. Merge tags will be replaced with actual data when sent.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Send Result */}
          {result && (
            <Card>
              <CardContent className="pt-6">
                <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                  result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {result.success ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{result.message}</p>
                    {result.emailId && (
                      <p className="text-sm mt-1">Email ID: {result.emailId}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Send Button */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={sendTestEmail}
              disabled={loading || !validateEmail(testEmail) || !templateHtml.trim()}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? 'Sending...' : 'Send Test Email'}
            </Button>
          </div>

          {/* Email Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h4 className="font-medium text-blue-900 mb-2">Test Email Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check your spam folder if you don't receive the email</li>
                <li>• Test emails include tracking pixels and click tracking</li>
                <li>• Use different email addresses to test various scenarios</li>
                <li>• Configure template data to test merge tag functionality</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}