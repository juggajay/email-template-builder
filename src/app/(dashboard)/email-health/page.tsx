'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DomainHealth {
  domain: string;
  status: 'verified' | 'pending' | 'failed';
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
}

interface EmailMetrics {
  deliveryRate: number;
  bounceRate: number;
  spamRate: number;
  unsubscribeRate: number;
  totalSent: number;
}

interface RecentEmail {
  id: string;
  subject: string;
  status: string;
  sentAt: string;
  recipient: string;
}

export default function EmailHealthDashboard() {
  const [domainHealth, setDomainHealth] = useState<DomainHealth | null>(null);
  const [metrics, setMetrics] = useState<EmailMetrics | null>(null);
  const [recentEmails, setRecentEmails] = useState<RecentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDomainHealth = async () => {
    try {
      const response = await fetch('/api/email/domains');
      if (response.ok) {
        const { domains } = await response.json();
        if (domains && domains.length > 0) {
          const primary = domains[0];
          const spfRecord = primary.spf_record ? JSON.parse(primary.spf_record) : null;
          const dkimRecord = primary.dkim_record ? JSON.parse(primary.dkim_record) : null;
          const dmarcRecord = primary.dmarc_record ? JSON.parse(primary.dmarc_record) : null;
          
          setDomainHealth({
            domain: primary.domain,
            status: primary.status,
            spf: spfRecord?.verified || false,
            dkim: dkimRecord?.verified || false,
            dmarc: dmarcRecord?.verified || false
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch domain health:', error);
    }
  };

  const fetchEmailMetrics = async () => {
    try {
      const response = await fetch('/api/email/sent?limit=100');
      if (response.ok) {
        const { emails, pagination } = await response.json();
        
        // Calculate metrics
        const total = pagination.total || 0;
        const delivered = emails.filter((e: any) => e.status === 'delivered').length;
        const bounced = emails.filter((e: any) => e.status === 'bounced').length;
        const spam = emails.filter((e: any) => e.status === 'complained').length;
        
        setMetrics({
          deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
          bounceRate: total > 0 ? (bounced / total) * 100 : 0,
          spamRate: total > 0 ? (spam / total) * 100 : 0,
          unsubscribeRate: 0, // Would need webhook data
          totalSent: total
        });

        // Set recent emails
        setRecentEmails(emails.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch email metrics:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchDomainHealth(), fetchEmailMetrics()]);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDomainHealth(), fetchEmailMetrics()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const getStatusIcon = (verified: boolean) => {
    return verified ? (
      <CheckCircle className="text-green-500 w-5 h-5" />
    ) : (
      <XCircle className="text-red-500 w-5 h-5" />
    );
  };

  const getEmailGrade = (status: string) => {
    switch (status) {
      case 'delivered':
        return { grade: 'A', color: 'text-green-600' };
      case 'sent':
        return { grade: 'B', color: 'text-blue-600' };
      case 'bounced':
        return { grade: 'F', color: 'text-red-600' };
      case 'complained':
        return { grade: 'D', color: 'text-orange-600' };
      default:
        return { grade: 'C', color: 'text-yellow-600' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading email health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Email Health Dashboard</h1>
        <Button
          onClick={refreshData}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Domain Health */}
        <Card>
          <CardHeader>
            <CardTitle>Domain Health</CardTitle>
            {domainHealth && (
              <Badge variant={domainHealth.status === 'verified' ? 'default' : 'secondary'}>
                {domainHealth.domain}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {domainHealth ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>SPF Record</span>
                  {getStatusIcon(domainHealth.spf)}
                </div>
                <div className="flex justify-between items-center">
                  <span>DKIM Signature</span>
                  {getStatusIcon(domainHealth.dkim)}
                </div>
                <div className="flex justify-between items-center">
                  <span>DMARC Policy</span>
                  {getStatusIcon(domainHealth.dmarc)}
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-medium">{domainHealth.status}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No domain configured</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.location.href = '/email-settings'}
                >
                  Configure Domain
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Delivery Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics ? (
              <>
                <div className="text-3xl font-bold">
                  {metrics.deliveryRate.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Delivery Rate ({metrics.totalSent} total emails)
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Bounces</span>
                    <span className="font-medium">{metrics.bounceRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spam Reports</span>
                    <span className="font-medium">{metrics.spamRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unsubscribes</span>
                    <span className="font-medium">{metrics.unsubscribeRate.toFixed(1)}%</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">No email data available</p>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sends</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEmails.length > 0 ? (
              <div className="space-y-2">
                {recentEmails.map((email) => {
                  const { grade, color } = getEmailGrade(email.status);
                  return (
                    <div key={email.id} className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {email.subject || 'No subject'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {email.recipient}
                        </p>
                      </div>
                      <span className={`font-bold text-sm ml-2 ${color}`}>
                        {grade}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent emails</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      {metrics && metrics.totalSent === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Start sending emails to see your delivery metrics
            </p>
            <Button onClick={() => window.location.href = '/editor'}>
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}