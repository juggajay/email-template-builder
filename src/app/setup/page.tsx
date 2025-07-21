import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function SetupPage() {
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  const checks = {
    supabaseUrl: {
      isSet: !!supabaseUrl,
      isValid: supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co'),
      value: supabaseUrl,
    },
    supabaseAnonKey: {
      isSet: !!supabaseAnonKey,
      isValid: supabaseAnonKey !== 'your-anon-key-here' && supabaseAnonKey.length > 20,
      value: supabaseAnonKey,
    },
    siteUrl: {
      isSet: !!siteUrl,
      isValid: true,
      value: siteUrl,
    },
  };

  const allChecked = Object.values(checks).every(v => v.isSet && v.isValid);

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
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                {checks.supabaseUrl.isSet && checks.supabaseUrl.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={checks.supabaseUrl.isSet && checks.supabaseUrl.isValid ? 'text-green-700' : 'text-red-700'}>
                  NEXT_PUBLIC_SUPABASE_URL
                </span>
              </div>
              {checks.supabaseUrl.isSet && (
                <div className="ml-8 text-sm text-gray-600">
                  {checks.supabaseUrl.isValid ? (
                    <span className="font-mono">{checks.supabaseUrl.value}</span>
                  ) : (
                    <span className="text-red-600">Invalid URL format: {checks.supabaseUrl.value}</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                {checks.supabaseAnonKey.isSet && checks.supabaseAnonKey.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={checks.supabaseAnonKey.isSet && checks.supabaseAnonKey.isValid ? 'text-green-700' : 'text-red-700'}>
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </span>
              </div>
              {checks.supabaseAnonKey.isSet && (
                <div className="ml-8 text-sm text-gray-600">
                  {checks.supabaseAnonKey.isValid ? (
                    <span className="font-mono">{checks.supabaseAnonKey.value.substring(0, 20)}...</span>
                  ) : (
                    <span className="text-red-600">Invalid key (using placeholder)</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                {checks.siteUrl.isSet ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={checks.siteUrl.isSet ? 'text-green-700' : 'text-red-700'}>
                  NEXT_PUBLIC_SITE_URL
                </span>
              </div>
              {checks.siteUrl.isSet && (
                <div className="ml-8 text-sm text-gray-600">
                  <span className="font-mono">{checks.siteUrl.value}</span>
                </div>
              )}
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