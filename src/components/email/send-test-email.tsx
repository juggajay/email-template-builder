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
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { PreviewDataEditor } from '../editor/merge-tags-enhanced/preview-data';
import { processEmailImages, validateEmailImages, addImageDimensions } from '@/lib/email/image-processor';
import { safeProcessEmailImages, safeAddImageDimensions } from '@/lib/email/image-processor-safe';

interface SendTestEmailProps {
  templateHtml?: string;
  templateSubject?: string;
  editorRef?: any;
  onEmailSent?: (result: any) => void;
  deliverabilityScore?: number;
}

const RECENT_RECIPIENTS_KEY = 'test-email-recent-recipients';
const MAX_RECENT_RECIPIENTS = 3;
const RATE_LIMIT_KEY = 'test-email-rate-limit';
const MAX_SENDS_PER_HOUR = 10;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

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
  editorRef,
  onEmailSent,
  deliverabilityScore 
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
  const [rateLimitWarning, setRateLimitWarning] = useState<string | null>(null);
  const [emailsSentInWindow, setEmailsSentInWindow] = useState<number>(0);

  // Load recent recipients and check rate limit on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load recent recipients
      const saved = localStorage.getItem(RECENT_RECIPIENTS_KEY);
      if (saved) {
        try {
          setRecentRecipients(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load recent recipients:', e);
        }
      }

      // Check current rate limit status
      const rateLimitData = localStorage.getItem(RATE_LIMIT_KEY);
      if (rateLimitData) {
        try {
          const { sends, resetTime } = JSON.parse(rateLimitData);
          if (Date.now() < resetTime) {
            setEmailsSentInWindow(sends);
          }
        } catch (e) {
          console.error('Failed to parse rate limit data:', e);
        }
      }
    }
  }, []);

  // Check rate limit
  const checkRateLimit = (): { allowed: boolean; remainingTime?: number } => {
    if (typeof window === 'undefined') return { allowed: true };

    const now = Date.now();
    const rateLimitData = localStorage.getItem(RATE_LIMIT_KEY);
    
    if (!rateLimitData) {
      return { allowed: true };
    }

    try {
      const { sends, resetTime } = JSON.parse(rateLimitData);
      
      // If the window has passed, reset
      if (now >= resetTime) {
        localStorage.removeItem(RATE_LIMIT_KEY);
        return { allowed: true };
      }

      // Check if limit reached
      if (sends >= MAX_SENDS_PER_HOUR) {
        const remainingTime = Math.ceil((resetTime - now) / 1000 / 60); // minutes
        return { allowed: false, remainingTime };
      }

      return { allowed: true };
    } catch (e) {
      console.error('Failed to parse rate limit data:', e);
      localStorage.removeItem(RATE_LIMIT_KEY);
      return { allowed: true };
    }
  };

  // Update rate limit
  const updateRateLimit = () => {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const rateLimitData = localStorage.getItem(RATE_LIMIT_KEY);
    
    if (!rateLimitData) {
      // First send in the window
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
        sends: 1,
        resetTime: now + RATE_LIMIT_WINDOW
      }));
      setEmailsSentInWindow(1);
      return;
    }

    try {
      const { sends, resetTime } = JSON.parse(rateLimitData);
      
      // If the window has passed, start a new one
      if (now >= resetTime) {
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
          sends: 1,
          resetTime: now + RATE_LIMIT_WINDOW
        }));
        setEmailsSentInWindow(1);
      } else {
        // Increment sends in current window
        const newSends = sends + 1;
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
          sends: newSends,
          resetTime
        }));
        setEmailsSentInWindow(newSends);
      }
    } catch (e) {
      console.error('Failed to update rate limit:', e);
      // Start fresh if there's an error
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
        sends: 1,
        resetTime: now + RATE_LIMIT_WINDOW
      }));
      setEmailsSentInWindow(1);
    }
  };

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
    // Check deliverability score first
    if (deliverabilityScore !== undefined && deliverabilityScore < 70) {
      const confirmSend = window.confirm(
        `Warning: Your email has a low deliverability score (${deliverabilityScore}%).\n\n` +
        'Emails with scores below 70% may be marked as spam.\n\n' +
        'Do you still want to send the test email?'
      );
      if (!confirmSend) {
        return;
      }
    }

    // Check rate limit
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      setRateLimitWarning(`Test email limit reached. Try again in ${rateLimit.remainingTime} minutes.`);
      return;
    }

    if (!testEmail.trim()) {
      alert('Please enter a test email address');
      return;
    }

    setLoading(true);
    setResult(null);
    setRateLimitWarning(null);

    try {
      // Get the current HTML from the editor if available
      let htmlToSend = templateHtml;
      
      console.log('[SendTestEmail] Starting email send:', {
        hasTemplateHtml: !!templateHtml,
        templateHtmlLength: templateHtml?.length || 0,
        hasEditorRef: !!editorRef,
        hasExportHtml: !!(editorRef && editorRef.exportHtml)
      });
      
      if (editorRef && editorRef.exportHtml) {
        console.log('[SendTestEmail] Exporting current HTML from editor...');
        try {
          await new Promise<void>((resolve, reject) => {
            // Set a timeout to prevent hanging
            const timeoutId = setTimeout(() => {
              console.error('[SendTestEmail] Export timeout after 5 seconds');
              reject(new Error('Export timeout'));
            }, 5000);
            
            editorRef.exportHtml((data: any) => {
              clearTimeout(timeoutId); // Clear timeout if export succeeds
              
              if (data && data.html) {
                // Store the original HTML first
                htmlToSend = data.html;
                console.log('[SendTestEmail] Exported HTML length:', htmlToSend.length);
                
                // Try to process images using the safer version
                try {
                  console.log('[SendTestEmail] Processing images...');
                  const safeResult = safeProcessEmailImages(htmlToSend);
                  
                  if (safeResult.errors.length > 0) {
                    console.warn('[SendTestEmail] Image processing warnings:', safeResult.errors);
                  }
                  
                  // Only use processed HTML if it's valid and not corrupted
                  if (safeResult.html && safeResult.html.length >= htmlToSend.length * 0.8) {
                    htmlToSend = safeAddImageDimensions(safeResult.html);
                    console.log('[SendTestEmail] Image processing complete:', {
                      originalLength: data.html.length,
                      processedLength: htmlToSend.length,
                      imageCount: safeResult.imageCount
                    });
                  } else {
                    console.warn('[SendTestEmail] Processed HTML seems corrupted, using original');
                  }
                } catch (imageError) {
                  console.error('[SendTestEmail] Image processing error:', imageError);
                  // Keep using the original HTML
                }
                
                resolve();
              } else {
                console.error('[SendTestEmail] No HTML data from export');
                // Don't reject, try to use templateHtml instead
                htmlToSend = templateHtml;
                resolve();
              }
            });
          });
        } catch (error) {
          console.error('[SendTestEmail] Export failed:', error);
          // Fall back to using templateHtml if export fails
          htmlToSend = templateHtml;
        }
      } else {
        console.log('[SendTestEmail] Using templateHtml prop, length:', htmlToSend.length);
        
        // Process templateHtml to ensure absolute URLs
        if (htmlToSend && htmlToSend.length > 0) {
          try {
            console.log('[SendTestEmail] Processing templateHtml images...');
            const safeResult = safeProcessEmailImages(htmlToSend);
            
            if (safeResult.errors.length > 0) {
              console.warn('[SendTestEmail] Template image processing warnings:', safeResult.errors);
            }
            
            // Only use processed HTML if it's valid
            if (safeResult.html && safeResult.html.length >= htmlToSend.length * 0.8) {
              const originalLength = htmlToSend.length;
              htmlToSend = safeAddImageDimensions(safeResult.html);
              console.log('[SendTestEmail] Template HTML processed:', {
                originalLength,
                processedLength: htmlToSend.length,
                imageCount: safeResult.imageCount
              });
            } else {
              console.warn('[SendTestEmail] Template processed HTML seems corrupted, using original');
            }
          } catch (error) {
            console.error('[SendTestEmail] Error processing template HTML:', error);
            // Continue with original HTML if processing fails
          }
        } else {
          console.warn('[SendTestEmail] No templateHtml to process');
        }
      }

      if (!htmlToSend || htmlToSend.trim().length === 0) {
        alert('No template content to send. Please add some content to your template.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: testEmail,
          html: htmlToSend,
          templateData: previewData,
          provider,
          subject
        })
      });

      const data = await response.json();

      if (response.status === 429) {
        // Server-side rate limit hit
        setRateLimitWarning(data.error);
        setResult(null);
        return;
      }

      if (data.success) {
        setResult({
          success: true,
          message: data.message || 'Test email sent successfully!',
          emailId: data.emailId
        });
        setShowSuccess(true);
        updateRecentRecipients(testEmail);
        updateRateLimit();
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
    setRateLimitWarning(null); // Clear rate limit warning
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
        <Button 
          className={`flex items-center gap-2 ${
            deliverabilityScore !== undefined && deliverabilityScore < 70 
              ? 'border-yellow-500' 
              : ''
          }`}
          variant={deliverabilityScore !== undefined && deliverabilityScore < 70 ? 'outline' : 'default'}
        >
          {deliverabilityScore !== undefined && deliverabilityScore < 70 && (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          )}
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Email Configuration</CardTitle>
                {emailsSentInWindow > 0 && (
                  <Badge variant={emailsSentInWindow >= MAX_SENDS_PER_HOUR ? "destructive" : "secondary"}>
                    {emailsSentInWindow}/{MAX_SENDS_PER_HOUR} sent this hour
                  </Badge>
                )}
              </div>
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
          {(templateHtml || editorRef) && (
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
                      __html: templateHtml || '<p class="text-gray-500">Loading preview...</p>' 
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This is a preview of your template. Merge tags will be replaced with actual data when sent.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Rate Limit Warning */}
          {rateLimitWarning && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <p className="text-amber-800 font-medium">{rateLimitWarning}</p>
                </div>
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
              disabled={loading || !validateEmail(testEmail) || (!templateHtml?.trim() && !editorRef)}
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