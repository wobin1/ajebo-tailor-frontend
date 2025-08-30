'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, User, Heart, Settings, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const navigation = [
  { name: "Men's", href: '/products/mens' },
  { name: "Women's", href: '/products/womens' },
  { name: 'Kids', href: '/products/kids' },
  { name: 'Accessories', href: '/products/accessories' },
  { name: 'Gifts', href: '/products/gifts' },
];

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const router = useRouter();

  return (
    <>
      {/* Top Banner */}
      <div className="bg-black text-white text-center py-2 px-4 text-sm">
        IT'S NOT TOO LATE TO GIVE A MEANINGFUL CHRISTMAS GIFT 🎁 (FIND OUT HERE)
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium uppercase tracking-wide transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-gray-900 tracking-wider">
                AJB
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden sm:flex"
                onClick={() => router.push('/search')}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>

              {/* Wishlist */}
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Button>

              {/* Cart */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={toggleCart}
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
                <span className="sr-only">Shopping cart</span>
              </Button>

              {/* Dashboard Buttons for Admin/Designer */}
              {isAuthenticated && user?.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="ghost" size="icon" title="Admin Dashboard">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Admin Dashboard</span>
                  </Button>
                </Link>
              )}
              
              {isAuthenticated && user?.role === 'designer' && (
                <Link href="/designer">
                  <Button variant="ghost" size="icon" title="Designer Dashboard">
                    <Scissors className="h-5 w-5" />
                    <span className="sr-only">Designer Dashboard</span>
                  </Button>
                </Link>
              )}

              {/* User Account */}
              {isAuthenticated ? (
                <Link href="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Account</span>
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="text-sm">
                      Login
                    </Button>
                  </Link>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-600">ENG / FRN</span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden border-t border-gray-200 py-3">
            <nav className="flex items-center justify-center space-x-6">
              {navigation.slice(0, 3).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-900 hover:text-gray-600 text-sm font-medium uppercase tracking-wide"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
