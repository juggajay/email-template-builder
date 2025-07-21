import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { ZebCharacter } from '@/components/brand';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-systematic-grey to-growth-green/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ZebCharacter variant="default" size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-zebra-black">Reset Your Password</h1>
          <p className="text-gray-600 mt-2">We'll send you a link to reset your password</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}