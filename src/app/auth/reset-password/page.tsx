'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (_data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call with token validation
      if (!token) {
        throw new Error('Invalid reset token');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/auth/login?message=password-reset-success');
    } catch {
      setError('Failed to reset password. Please try again or request a new reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-3xl font-light tracking-wider text-gray-900">
            Invalid Reset Link
          </h2>
          <p className="mt-4 text-sm text-gray-600">
            This password reset link is invalid or has expired.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/auth/forgot-password">
            <Button className="w-full bg-black text-white hover:bg-gray-900">
              Request New Reset Link
            </Button>
          </Link>
          
          <Link href="/auth/login">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-center text-3xl font-light tracking-wider text-gray-900">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your new password below
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <div className="mt-1">
            <Input
              {...register('password')}
              type="password"
              autoComplete="new-password"
              placeholder="Enter your new password"
              className={errors.password ? 'border-red-300' : ''}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <div className="mt-1">
            <Input
              {...register('confirmPassword')}
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your new password"
              className={errors.confirmPassword ? 'border-red-300' : ''}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div>
          <Button
            type="submit"
            className="w-full bg-black text-white hover:bg-gray-900"
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </div>

        <div className="text-center">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-black hover:text-gray-700"
          >
            ← Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}