import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function SetupPage() {
  // Check environment variables
  const checks = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    siteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
  };

  const allChecked = Object.values(checks).every(v => v);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">ZebaMail Setup Guide</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Environment Configuration</CardTitle>
            <CardDescription>
              Check if your environment variables are properly configured
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {checks.supabaseUrl ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={checks.supabaseUrl ? 'text-green-700' : 'text-red-700'}>
                NEXT_PUBLIC_SUPABASE_URL {checks.supabaseUrl ? 'is set' : 'is missing'}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {checks.supabaseAnonKey ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={checks.supabaseAnonKey ? 'text-green-700' : 'text-red-700'}>
                NEXT_PUBLIC_SUPABASE_ANON_KEY {checks.supabaseAnonKey ? 'is set' : 'is missing'}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {checks.siteUrl ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={checks.siteUrl ? 'text-green-700' : 'text-red-700'}>
                NEXT_PUBLIC_SITE_URL {checks.siteUrl ? 'is set' : 'is missing'}
              </span>
            </div>
          </CardContent>
        </Card>

        {!allChecked && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Setup Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>To set up ZebaMail, follow these steps:</p>
              
              <ol className="space-y-3 list-decimal list-inside">
                <li>
                  <strong>Copy the environment file:</strong>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-sm">
                    cp .env.local.example .env.local
                  </pre>
                </li>
                
                <li>
                  <strong>Set up Supabase:</strong>
                  <ul className="mt-2 ml-6 space-y-1 text-sm">
                    <li>• Go to <a href="https://supabase.com" target="_blank" className="text-blue-600 hover:underline">supabase.com</a></li>
                    <li>• Create a new project</li>
                    <li>• Copy your project URL and anon key</li>
                  </ul>
                </li>
                
                <li>
                  <strong>Update .env.local with your values:</strong>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000`}
                  </pre>
                </li>
                
                <li>
                  <strong>Run database migrations:</strong>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-sm">
                    npm run db:migrate
                  </pre>
                </li>
                
                <li>
                  <strong>Restart the development server:</strong>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-sm">
                    npm run dev
                  </pre>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {allChecked && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Setup Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Great! Your environment is properly configured.</p>
              <a 
                href="/login" 
                className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Go to Login
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}