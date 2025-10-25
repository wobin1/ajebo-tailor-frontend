'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (_data: ForgotPasswordFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-3xl font-light tracking-wider text-gray-900">
            Check Your Email
          </h2>
          <p className="mt-4 text-sm text-gray-600">
            We&apos;ve sent a password reset link to your email address.
            Please check your inbox and follow the instructions.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/auth/login">
            <Button className="w-full bg-black text-white hover:bg-gray-900">
              Back to Sign In
            </Button>
          </Link>
          
          <p className="text-sm text-gray-600">
            Didn&apos;t receive the email?{' '}
            <button
              onClick={() => setIsSubmitted(false)}
              className="font-medium text-black hover:text-gray-700"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-center text-3xl font-light tracking-wider text-gray-900">
          Forgot Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <Input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              className={errors.email ? 'border-red-300' : ''}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <Button
            type="submit"
            className="w-full bg-black text-white hover:bg-gray-900"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
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