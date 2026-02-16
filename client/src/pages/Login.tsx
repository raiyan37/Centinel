/**
 * Login Page
 *
 * CONCEPT: Allows users to log in with email/password or Google.
 * Features:
 * - Email/password form with validation
 * - Google Sign-In button
 * - Link to register page
 * - Enhanced error handling with user-friendly messages
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts';
import { Button, Input, Label } from '@/components/ui';
import { getErrorMessage, isNetworkError } from '@/lib/errorUtils';
import { emailSchema } from '@/lib/validation';

// =============================================================================
// VALIDATION
// =============================================================================

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// =============================================================================
// COMPONENT
// =============================================================================

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Get redirect path from location state
  const from = (location.state as { from?: string })?.from || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  /**
   * Handle email/password login
   */
  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      // Use centralized error handling for better error messages
      if (isNetworkError(err)) {
        setError('Unable to connect to server. Please check your internet connection.');
      } else {
        setError(getErrorMessage(err));
      }
    }
  };

  /**
   * Handle Google sign-in (redirects to Google OAuth)
   */
  const handleGoogleClick = () => {
    setError(null);
    loginWithGoogle();
  };

  const isLoading = isSubmitting;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Illustration (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--color-grey-900)] items-center justify-center p-12">
        <div className="max-w-md text-center">
          {/* Logo */}
          <img
            src="/assets/images/logo-large.svg"
            alt="Centinel"
            className="h-8 mb-8 mx-auto"
          />
          <img
            src="/assets/images/illustration-authentication.svg"
            alt="Centinel illustration"
            className="w-full max-w-sm mx-auto mb-8"
          />
          <h2 className="text-2xl font-bold text-white mb-3">
            Keep track of your money and save for your future
          </h2>
          <p className="text-[var(--color-grey-300)]">
            Centinel puts you in control of your spending. Track
            transactions, set budgets, and add to savings pots easily.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--color-beige-100)]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src="/assets/images/logo-large.svg"
              alt="Centinel"
              className="h-6"
              style={{ filter: 'invert(1)' }}
            />
          </div>

          {/* Form card */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-grey-900)] mb-2">
              Login
            </h1>
            <p className="text-[var(--color-grey-500)] mb-8">
              Welcome back! Enter your details to access your account.
            </p>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-red-50 text-[var(--color-red)]">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  startIcon={<Mail className="w-4 h-4" />}
                  error={!!errors.email}
                  disabled={isLoading}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-[var(--color-red)]">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  startIcon={<Lock className="w-4 h-4" />}
                  error={!!errors.password}
                  disabled={isLoading}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-[var(--color-red)]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-grey-100)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[var(--color-grey-500)]">
                  or continue with
                </span>
              </div>
            </div>

            {/* Google Sign-In */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleClick}
                disabled={isLoading}
              >
                Continue with Google
              </Button>
            </div>

            {/* Register link */}
            <p className="mt-6 text-center text-sm text-[var(--color-grey-500)]">
              Need to create an account?{' '}
              <Link
                to="/register"
                className="font-bold text-[var(--color-grey-900)] hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
