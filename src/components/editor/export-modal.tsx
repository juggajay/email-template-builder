'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Mail, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  html: string;
  design: any;
  templateId?: string;
}

export function ExportModal({ isOpen, onClose, html, design, templateId }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [credentials, setCredentials] = useState({
    klaviyo: { apiKey: '' },
    mailchimp: { apiKey: '' },
    shopify: { shop: '', accessToken: '' }
  });

  const handleExport = async (platform: string) => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          platform,
          html,
          design,
          credentials: credentials[platform as keyof typeof credentials]
        })
      });

      const result = await response.json();

      if (result.success) {
        if (platform === 'html') {
          // Download HTML file
          const blob = new Blob([result.html], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'email-template.html';
          a.click();
          URL.revokeObjectURL(url);
        }
        
        toast.success(`Successfully exported to ${platform}!`);
        onClose();
      } else {
        toast.error(result.error || 'Export failed');
      }
    } catch (error) {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Template</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="download" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="download">
              <Download className="w-4 h-4 mr-2" />
              Download
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="w-4 h-4 mr-2" />
              Email Platforms
            </TabsTrigger>
            <TabsTrigger value="ecommerce">
              <ShoppingBag className="w-4 h-4 mr-2" />
              E-commerce
            </TabsTrigger>
          </TabsList>

          <TabsContent value="download" className="space-y-4 mt-4">
            <div className="text-center py-8">
              <Download className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium mb-2">Download as HTML</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get a clean, optimized HTML file ready for any email platform
              </p>
              <Button onClick={() => handleExport('html')} disabled={isExporting}>
                Download HTML
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="grid gap-4">
              {/* Klaviyo */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Klaviyo</h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="klaviyo-key">API Key</Label>
                    <Input
                      id="klaviyo-key"
                      type="password"
                      placeholder="pk_..."
                      value={credentials.klaviyo.apiKey}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        klaviyo: { apiKey: e.target.value }
                      })}
                    />
                  </div>
                  <Button 
                    onClick={() => handleExport('klaviyo')} 
                    disabled={!credentials.klaviyo.apiKey || isExporting}
                    className="w-full"
                  >
                    Export to Klaviyo
                  </Button>
                </div>
              </div>

              {/* Mailchimp */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Mailchimp</h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="mailchimp-key">API Key</Label>
                    <Input
                      id="mailchimp-key"
                      type="password"
                      placeholder="xxxxxxxx-us1"
                      value={credentials.mailchimp.apiKey}
                      onChange={(e) => setCredentials({
                        ...credentials,
                        mailchimp: { apiKey: e.target.value }
                      })}
                    />
                  </div>
                  <Button 
                    onClick={() => handleExport('mailchimp')} 
                    disabled={!credentials.mailchimp.apiKey || isExporting}
                    className="w-full"
                  >
                    Export to Mailchimp
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ecommerce" className="space-y-4 mt-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Shopify</h4>
              <p className="text-sm text-gray-600 mb-4">
                Connect your Shopify store to use this template for notifications
              </p>
              <Button variant="outline" className="w-full">
                Connect Shopify Store
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}