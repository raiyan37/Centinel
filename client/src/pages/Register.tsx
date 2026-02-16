/**
 * Register Page
 *
 * CONCEPT: Allows new users to create an account.
 * Features:
 * - Registration form with validation
 * - Google Sign-In button
 * - Link to login page
 * - Enhanced error handling with user-friendly messages
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts';
import { Button, Input, Label } from '@/components/ui';
import { getErrorMessage, isNetworkError } from '@/lib/errorUtils';
import { emailSchema, passwordSchema, fullNameSchema } from '@/lib/validation';

// =============================================================================
// VALIDATION
// =============================================================================

const registerSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// =============================================================================
// COMPONENT
// =============================================================================

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
      navigate('/', { replace: true });
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
  const handleGoogleClick = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      // Browser/SDK can abort OAuth redirects when navigation state changes.
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(getErrorMessage(err));
    }
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

      {/* Right side - Register form */}
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
              Sign Up
            </h1>
            <p className="text-[var(--color-grey-500)] mb-8">
              Create your account to start managing your money with Centinel.
            </p>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-red-50 text-[var(--color-red)]">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Register form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  startIcon={<User className="w-4 h-4" />}
                  error={!!errors.fullName}
                  disabled={isLoading}
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <p className="text-sm text-[var(--color-red)]">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

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
                <Label htmlFor="password">Create Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  startIcon={<Lock className="w-4 h-4" />}
                  error={!!errors.confirmPassword}
                  disabled={isLoading}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-[var(--color-red)]">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
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
                  or sign up with
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
                Sign up with Google
              </Button>
            </div>

            {/* Login link */}
            <p className="mt-6 text-center text-sm text-[var(--color-grey-500)]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-[var(--color-grey-900)] hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
