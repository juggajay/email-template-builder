'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Mail, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface EmailProvider {
  name: string;
  type: 'resend' | 'sendgrid';
  configured: boolean;
  connected: boolean;
  defaultFromEmail?: string;
  defaultFromName?: string;
}

interface DomainRecord {
  id: string;
  domain: string;
  status: 'pending' | 'verified' | 'failed';
  provider: string;
  dkimRecord?: any;
  spfRecord?: any;
  dmarcRecord?: any;
  lastChecked: string;
}

export function EmailServiceConfig() {
  const [providers, setProviders] = useState<EmailProvider[]>([]);
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [activeTab, setActiveTab] = useState('providers');
  const [loading, setLoading] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'resend' | 'sendgrid'>('resend');

  useEffect(() => {
    loadProviders();
    loadDomains();
  }, []);

  const loadProviders = async () => {
    try {
      const response = await fetch('/api/email/providers');
      const data = await response.json();
      setProviders(data.providers || []);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  const loadDomains = async () => {
    try {
      const response = await fetch('/api/email/domains');
      const data = await response.json();
      setDomains(data.domains || []);
    } catch (error) {
      console.error('Failed to load domains:', error);
    }
  };

  const testConnection = async (providerType: 'resend' | 'sendgrid') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/email/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerType })
      });
      
      const result = await response.json();
      
      // Update provider status
      setProviders(prev => prev.map(p => 
        p.type === providerType 
          ? { ...p, connected: result.connected }
          : p
      ));

      alert(result.connected ? 'Connection successful!' : 'Connection failed');
    } catch (error) {
      alert('Connection test failed');
    } finally {
      setLoading(false);
    }
  };

  const addDomain = async () => {
    if (!newDomain.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/email/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          domain: newDomain.trim(),
          provider: selectedProvider 
        })
      });

      if (response.ok) {
        setNewDomain('');
        loadDomains();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add domain');
      }
    } catch (error) {
      alert('Failed to add domain');
    } finally {
      setLoading(false);
    }
  };

  const verifyDomain = async (domain: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/email/domains/${encodeURIComponent(domain)}/verify`, {
        method: 'POST'
      });

      if (response.ok) {
        loadDomains();
        const result = await response.json();
        alert(result.verified ? 'Domain verified!' : 'Domain verification pending');
      } else {
        alert('Verification check failed');
      }
    } catch (error) {
      alert('Verification check failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      verified: { variant: 'default', icon: CheckCircle, label: 'Verified' },
      pending: { variant: 'secondary', icon: AlertTriangle, label: 'Pending' },
      failed: { variant: 'destructive', icon: XCircle, label: 'Failed' }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Service Configuration</h2>
          <p className="text-gray-600">
            Configure email providers and verify domains for sending
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid gap-4">
            {/* Resend Provider */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-6 h-6" />
                    <div>
                      <CardTitle>Resend</CardTitle>
                      <p className="text-sm text-gray-600">
                        Simple email API for developers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={providers.find(p => p.type === 'resend')?.connected ? 'verified' : 'pending'} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('resend')}
                      disabled={loading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Test
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="password"
                      placeholder="re_..."
                      value={providers.find(p => p.type === 'resend')?.configured ? '••••••••' : ''}
                      readOnly
                    />
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Get your API key from{' '}
                    <a href="https://resend.com/api-keys" target="_blank" className="underline">
                      Resend Dashboard
                    </a>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Default From Email</Label>
                    <Input
                      value={providers.find(p => p.type === 'resend')?.defaultFromEmail || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label>Default From Name</Label>
                    <Input
                      value={providers.find(p => p.type === 'resend')?.defaultFromName || ''}
                      readOnly
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SendGrid Provider */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-6 h-6" />
                    <div>
                      <CardTitle>SendGrid</CardTitle>
                      <p className="text-sm text-gray-600">
                        Enterprise email delivery platform
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={providers.find(p => p.type === 'sendgrid')?.connected ? 'verified' : 'pending'} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('sendgrid')}
                      disabled={loading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Test
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="password"
                      placeholder="SG...."
                      value={providers.find(p => p.type === 'sendgrid')?.configured ? '••••••••' : ''}
                      readOnly
                    />
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Get your API key from{' '}
                    <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" className="underline">
                      SendGrid Dashboard
                    </a>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Default From Email</Label>
                    <Input
                      value={providers.find(p => p.type === 'sendgrid')?.defaultFromEmail || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label>Default From Name</Label>
                    <Input
                      value={providers.find(p => p.type === 'sendgrid')?.defaultFromName || ''}
                      readOnly
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Domain</CardTitle>
              <p className="text-sm text-gray-600">
                Add a domain to verify for sending emails
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
                <Select value={selectedProvider} onValueChange={(value: any) => setSelectedProvider(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resend">Resend</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addDomain} disabled={loading || !newDomain.trim()}>
                  Add Domain
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {domains.map((domain) => (
              <Card key={domain.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{domain.domain}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Provider: {domain.provider} • Last checked: {new Date(domain.lastChecked).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={domain.status} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => verifyDomain(domain.domain)}
                        disabled={loading}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Verify
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {domain.status === 'pending' && (domain.dkimRecord || domain.spfRecord) && (
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Add these DNS records to verify your domain:
                    </p>
                    
                    {domain.dkimRecord && (
                      <div className="space-y-2">
                        <Label>DKIM Record</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={`${JSON.parse(domain.dkimRecord).name}`}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.parse(domain.dkimRecord).name)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={`${JSON.parse(domain.dkimRecord).value}`}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.parse(domain.dkimRecord).value)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {domain.spfRecord && (
                      <div className="space-y-2">
                        <Label>SPF/CNAME Record</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={`${JSON.parse(domain.spfRecord).name}`}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.parse(domain.spfRecord).name)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={`${JSON.parse(domain.spfRecord).value}`}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.parse(domain.spfRecord).value)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}

            {domains.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No domains configured yet</p>
                  <p className="text-sm text-gray-500">
                    Add a domain above to start sending emails
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Open Tracking</Label>
                  <p className="text-sm text-gray-600">
                    Track when recipients open your emails
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Click Tracking</Label>
                  <p className="text-sm text-gray-600">
                    Track when recipients click links in your emails
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Bounce Handling</Label>
                  <p className="text-sm text-gray-600">
                    Automatically handle bounced emails
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Webhook Endpoints</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={typeof window !== 'undefined' ? `${window.location.origin}/api/email/webhooks/resend` : '/api/email/webhooks/resend'}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}/api/email/webhooks/resend` : '/api/email/webhooks/resend')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={typeof window !== 'undefined' ? `${window.location.origin}/api/email/webhooks/sendgrid` : '/api/email/webhooks/sendgrid'}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}/api/email/webhooks/sendgrid` : '/api/email/webhooks/sendgrid')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Configure these webhooks in your provider dashboard to receive delivery events
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}