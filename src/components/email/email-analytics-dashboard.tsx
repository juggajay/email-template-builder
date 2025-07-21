'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Mail, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  AlertTriangle,
  ExternalLink,
  Calendar,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';

interface EmailAnalytics {
  emailId: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
  events: EmailEvent[];
  email: {
    subject: string;
    recipient: string;
    provider: string;
    sentAt: string;
    status: string;
  };
}

interface EmailEvent {
  id: string;
  type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed';
  timestamp: string;
  recipient: string;
  userAgent?: string;
  ipAddress?: string;
  link?: string;
  reason?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  metadata?: any;
}

interface SentEmail {
  id: string;
  emailId: string;
  subject: string;
  recipient: string;
  provider: string;
  status: string;
  sentAt: string;
  isTest: boolean;
}

export function EmailAnalyticsDashboard() {
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');

  useEffect(() => {
    loadSentEmails();
  }, []);

  const loadSentEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email/sent');
      const data = await response.json();
      setSentEmails(data.emails || []);
    } catch (error) {
      console.error('Failed to load sent emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmailAnalytics = async (emailId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/email/analytics/${emailId}`);
      const data = await response.json();
      setSelectedEmail(data.analytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = sentEmails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.recipient.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || email.status === filterStatus;
    const matchesProvider = filterProvider === 'all' || email.provider === filterProvider;
    
    return matchesSearch && matchesStatus && matchesProvider;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      sent: { variant: 'default', label: 'Sent' },
      delivered: { variant: 'default', label: 'Delivered' },
      bounced: { variant: 'destructive', label: 'Bounced' },
      complained: { variant: 'destructive', label: 'Complained' },
      failed: { variant: 'destructive', label: 'Failed' }
    };

    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getEventIcon = (eventType: string) => {
    const icons: Record<string, any> = {
      sent: Mail,
      delivered: Mail,
      opened: Eye,
      clicked: MousePointer,
      bounced: AlertTriangle,
      complained: AlertTriangle,
      unsubscribed: AlertTriangle
    };

    const Icon = icons[eventType] || Mail;
    return <Icon className="w-4 h-4" />;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Analytics</h2>
          <p className="text-gray-600">
            Track email performance and engagement
          </p>
        </div>
        <Button onClick={loadSentEmails} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Email List */}
        <Card>
          <CardHeader>
            <CardTitle>Sent Emails</CardTitle>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterProvider} onValueChange={setFilterProvider}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="resend">Resend</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedEmail?.emailId === email.emailId ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => loadEmailAnalytics(email.emailId)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm truncate flex-1 mr-2">
                      {email.subject}
                    </h4>
                    {getStatusBadge(email.status)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{email.recipient}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {email.provider}
                      </Badge>
                      {email.isTest && (
                        <Badge variant="secondary" className="text-xs">
                          Test
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(email.sentAt)}
                  </div>
                </div>
              ))}

              {filteredEmails.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No emails found</p>
                  <p className="text-sm">
                    {searchQuery || filterStatus !== 'all' || filterProvider !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Send your first email to see analytics'
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Email Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEmail ? (
              <div className="space-y-6">
                {/* Email Info */}
                <div className="space-y-2">
                  <h3 className="font-medium">{selectedEmail.email.subject}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>To: {selectedEmail.email.recipient}</p>
                    <p>Provider: {selectedEmail.email.provider}</p>
                    <p>Sent: {formatDate(selectedEmail.email.sentAt)}</p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPercentage(selectedEmail.openRate)}
                    </div>
                    <div className="text-sm text-gray-600">Open Rate</div>
                    <div className="text-xs text-gray-500">
                      {selectedEmail.opened}/{selectedEmail.delivered} opens
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(selectedEmail.clickRate)}
                    </div>
                    <div className="text-sm text-gray-600">Click Rate</div>
                    <div className="text-xs text-gray-500">
                      {selectedEmail.clicked}/{selectedEmail.delivered} clicks
                    </div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {formatPercentage(selectedEmail.bounceRate)}
                    </div>
                    <div className="text-sm text-gray-600">Bounce Rate</div>
                    <div className="text-xs text-gray-500">
                      {selectedEmail.bounced}/{selectedEmail.sent} bounces
                    </div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {formatPercentage(selectedEmail.complaintRate)}
                    </div>
                    <div className="text-sm text-gray-600">Complaint Rate</div>
                    <div className="text-xs text-gray-500">
                      {selectedEmail.complained}/{selectedEmail.delivered} complaints
                    </div>
                  </div>
                </div>

                {/* Event Timeline */}
                <div>
                  <h4 className="font-medium mb-3">Event Timeline</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedEmail.events.map((event) => (
                      <div key={event.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                        <div className="flex-shrink-0">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">
                              {event.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(event.timestamp)}
                            </span>
                          </div>
                          {event.link && (
                            <p className="text-xs text-blue-600 truncate">
                              {event.link}
                            </p>
                          )}
                          {event.reason && (
                            <p className="text-xs text-red-600">
                              {event.reason}
                            </p>
                          )}
                          {event.location && (
                            <p className="text-xs text-gray-500">
                              {[event.location.city, event.location.region, event.location.country]
                                .filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {selectedEmail.events.length === 0 && (
                      <p className="text-center text-gray-500 py-4">
                        No events recorded yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select an email to view analytics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}