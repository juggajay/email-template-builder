'use client';

import { EmailServiceConfig } from '@/components/email/email-service-config';
import { EmailAnalyticsDashboard } from '@/components/email/email-analytics-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const dynamic = 'force-dynamic';

export default function EmailSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Email Management</h1>
        <p className="text-gray-600 mt-2">
          Configure email providers, manage domains, and view analytics
        </p>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">Email Configuration</TabsTrigger>
          <TabsTrigger value="analytics">Email Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <EmailServiceConfig />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <EmailAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}