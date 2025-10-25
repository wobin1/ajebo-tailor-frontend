'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Home, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  // Show access denied if not designer
  if (user.role !== 'designer') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need designer privileges to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Designer Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900">Designer Panel</h2>
          </div>
          <nav className="mt-6">
            <div className="px-3 space-y-1">
              <a
                href="/designer"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                Dashboard
              </a>
              <a
                href="/designer/orders"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                Orders
              </a>
              <a
                href="/designer/measurements"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                Measurements
              </a>
              <a
                href="/designer/clients"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                Clients
              </a>
            </div>
            
            {/* Navigation Actions */}
            <div className="px-3 mt-8 space-y-1 border-t pt-4">
              <Button
                onClick={handleGoHome}
                variant="ghost"
                className="w-full justify-start px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
