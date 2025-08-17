import { CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const recentSends = [
  { id: 1, subject: 'Welcome Email', grade: 'A' },
  { id: 2, subject: 'Newsletter #47', grade: 'A' },
  { id: 3, subject: 'Product Update', grade: 'B' },
  { id: 4, subject: 'Holiday Sale', grade: 'B' },
  { id: 5, subject: 'Survey Request', grade: 'C' },
];

export default function EmailHealthDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Domain Health */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>SPF</span>
              <CheckCircle className="text-green-500" />
            </div>
            <div className="flex justify-between">
              <span>DKIM</span>
              <CheckCircle className="text-green-500" />
            </div>
            <div className="flex justify-between">
              <span>DMARC</span>
              <AlertCircle className="text-yellow-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Delivery Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">98.5%</div>
          <p className="text-sm text-gray-600">Last 30 days</p>
          <div className="mt-4 space-y-1 text-sm">
            <div>Bounces: 0.5%</div>
            <div>Spam Reports: 0.1%</div>
            <div>Unsubscribes: 0.9%</div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentSends.map((send) => (
              <div key={send.id} className="flex justify-between text-sm">
                <span>{send.subject}</span>
                <span className={`font-medium ${
                  send.grade === 'A' ? 'text-green-600' :
                  send.grade === 'B' ? 'text-blue-600' :
                  'text-yellow-600'
                }`}>
                  {send.grade}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}