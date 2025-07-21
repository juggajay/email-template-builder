'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/lib/supabase/auth';
import { betaAccessService } from '@/lib/beta-access';
import { AlertCircle } from 'lucide-react';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  companyName: z.string().optional(),
  inviteCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if beta access is required
      const isBetaAllowed = await betaAccessService.isEmailAllowedForBeta(data.email);
      
      if (!isBetaAllowed && !data.inviteCode) {
        setError('ZebaMail is currently in beta. Please enter your invite code or contact us for access.');
        setIsLoading(false);
        return;
      }

      // Validate invite code if provided
      if (data.inviteCode && !isBetaAllowed) {
        const { valid, reason } = await betaAccessService.validateInviteCode(data.inviteCode);
        if (!valid) {
          setError(reason || 'Invalid or expired invite code. Please check your code or contact us for access.');
          setIsLoading(false);
          return;
        }
      }

      const result = await signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        companyName: data.companyName,
      });
      
      if (result.error) {
        // Provide user-friendly error messages
        if (result.error.message.includes('already registered')) {
          setError('This email is already registered. Please sign in instead.');
        } else if (result.error.message.includes('weak_password')) {
          setError('Password is too weak. Please use a stronger password.');
        } else {
          setError(result.error.message);
        }
      } else {
        // Use the invite code after successful signup
        if (data.inviteCode && result.data?.user) {
          await betaAccessService.useInviteCode(data.inviteCode, result.data.user.id);
        }
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.signInWithProvider('google');
      if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      setError('Google sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            We've sent you a confirmation link to complete your registration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-success-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-4 text-sm text-muted-foreground">
              Click the link in the email to activate your account and start building professional email templates.
            </p>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push('/login')}
          >
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create account</CardTitle>
        <CardDescription className="text-center">
          Start building professional email templates in minutes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register('fullName')}
            type="text"
            label="Full Name"
            placeholder="John Doe"
            error={errors.fullName?.message}
            disabled={isLoading}
          />

          <Input
            {...register('email')}
            type="email"
            label="Email"
            placeholder="you@example.com"
            error={errors.email?.message}
            disabled={isLoading}
          />

          <Input
            {...register('companyName')}
            type="text"
            label="Company Name (Optional)"
            placeholder="Your Company"
            error={errors.companyName?.message}
            disabled={isLoading}
          />
          
          <Input
            {...register('password')}
            type="password"
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            disabled={isLoading}
          />

          <Input
            {...register('confirmPassword')}
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            disabled={isLoading}
          />

          <div className="space-y-2">
            <Input
              {...register('inviteCode')}
              type="text"
              label="Beta Invite Code"
              placeholder="BETA-XXXXXXXX"
              error={errors.inviteCode?.message}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              ZebaMail is in beta. Enter your invite code or request access.
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
              {error.includes('configured') && (
                <a 
                  href="/setup" 
                  className="block mt-2 text-primary hover:underline"
                >
                  View setup guide →
                </a>
              )}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            loading={isLoading}
            disabled={isLoading}
          >
            Create Account
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleGoogleSignUp}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-primary hover:underline"
          >
            Sign in
          </button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </div>
      </CardContent>
    </Card>
  );
}