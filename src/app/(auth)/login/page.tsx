import { LoginForm } from '@/components/auth/login-form';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Template Builder</h1>
          <p className="text-gray-600 mt-2">Professional e-commerce email templates in minutes</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}