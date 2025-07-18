'use client';

import { useState, useEffect } from 'react';
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
  Settings,
  ChevronDown,
  User,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { PreviewDataEditor } from '../editor/merge-tags-enhanced/preview-data';

interface SendTestEmailProps {
  templateHtml?: string;
  templateSubject?: string;
  onEmailSent?: (result: any) => void;
}

const RECENT_RECIPIENTS_KEY = 'test-email-recent-recipients';
const MAX_RECENT_RECIPIENTS = 3;

const commonTestEmails = [
  { label: 'Your email', value: 'your-email', placeholder: 'Enter your email...' },
  { label: 'Gmail test', value: 'test@gmail.com' },
  { label: 'Outlook test', value: 'test@outlook.com' },
  { label: 'Yahoo test', value: 'test@yahoo.com' },
  { label: 'Custom email...', value: 'custom', placeholder: 'Enter custom email...' }
];

export function SendTestEmail({ 
  templateHtml = '', 
  templateSubject = '',
  onEmailSent 
}: SendTestEmailProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [selectedEmailOption, setSelectedEmailOption] = useState('your-email');
  const [provider, setProvider] = useState<'resend' | 'sendgrid'>('resend');
  const [subject, setSubject] = useState(templateSubject || 'Test Email - Template Preview');
  const [previewData, setPreviewData] = useState<Record<string, any>>({});
  const [showPreviewData, setShowPreviewData] = useState(false);
  const [recentRecipients, setRecentRecipients] = useState<string[]>([]);
  const [activeDataProfile, setActiveDataProfile] = useState<string>('Default Test Data');
  const [showSuccess, setShowSuccess] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    emailId?: string;
  } | null>(null);

  // Load recent recipients on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(RECENT_RECIPIENTS_KEY);
      if (saved) {
        try {
          setRecentRecipients(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load recent recipients:', e);
        }
      }
    }
  }, []);

  // Update recent recipients when test email is sent successfully
  const updateRecentRecipients = (email: string) => {
    if (!email || !validateEmail(email)) return;
    
    const updated = [email, ...recentRecipients.filter(e => e !== email)].slice(0, MAX_RECENT_RECIPIENTS);
    setRecentRecipients(updated);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(RECENT_RECIPIENTS_KEY, JSON.stringify(updated));
    }
  };

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
        setShowSuccess(true);
        updateRecentRecipients(testEmail);
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

  const handleEmailOptionChange = (value: string) => {
    setSelectedEmailOption(value);
    
    if (value === 'your-email' || value === 'custom') {
      setTestEmail('');
    } else {
      setTestEmail(value);
    }
    
    setResult(null);
  };

  const handleSendAnother = () => {
    setShowSuccess(false);
    setResult(null);
    setTestEmail('');
    setSelectedEmailOption('your-email');
  };

  const getCurrentEmailPlaceholder = () => {
    const option = commonTestEmails.find(e => e.value === selectedEmailOption);
    return option?.placeholder || 'Enter email address...';
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
        {!showSuccess ? (
          <>
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
              <div className="space-y-2">
                <Label htmlFor="test-email">Test Email Address</Label>
                <Select value={selectedEmailOption} onValueChange={handleEmailOptionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test email" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonTestEmails.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(selectedEmailOption === 'your-email' || selectedEmailOption === 'custom') && (
                  <Input
                    id="test-email"
                    type="email"
                    placeholder={getCurrentEmailPlaceholder()}
                    value={testEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={!validateEmail(testEmail) && testEmail ? 'border-red-500' : ''}
                  />
                )}
                {!validateEmail(testEmail) && testEmail && (
                  <p className="text-sm text-red-500 mt-1">Please enter a valid email address</p>
                )}
                {recentRecipients.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Recent:</span> {recentRecipients.join(', ')}
                  </div>
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
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {activeDataProfile}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreviewData(true)}
                  className="text-xs"
                >
                  Change Profile
                </Button>
              </div>
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
          </>
        ) : (
          /* Success State */
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">✅ Test email sent successfully!</h3>
            <p className="text-gray-600 mb-6">
              Check your inbox (and spam folder) for the test email
            </p>
            {result?.emailId && (
              <p className="text-sm text-gray-500 mb-6">
                Email ID: {result.emailId}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  window.open('/email-settings?tab=analytics', '_blank');
                }}
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Email Analytics
              </Button>
              <Button
                onClick={handleSendAnother}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Send Another
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}