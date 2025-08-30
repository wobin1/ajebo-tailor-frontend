'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Shirt, User, Baby } from 'lucide-react';

const categories = [
  {
    name: "Men's Fashion",
    href: '/products/mens',
    icon: User,
    description: 'Suits, shirts, and formal wear',
    image: '/images/mens-category.jpg'
  },
  {
    name: "Women's Fashion", 
    href: '/products/womens',
    icon: Shirt,
    description: 'Dresses, blouses, and elegant wear',
    image: '/images/womens-category.jpg'
  },
  {
    name: "Kids Fashion",
    href: '/products/kids', 
    icon: Baby,
    description: 'Comfortable and stylish kids wear',
    image: '/images/kids-category.jpg'
  },
  {
    name: "Accessories",
    href: '/products/accessories',
    icon: Package,
    description: 'Belts, ties, and fashion accessories',
    image: '/images/accessories-category.jpg'
  }
];

export default function ProductsPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Product Categories
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our curated collection of premium fashion items, 
            tailored to perfection for every occasion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.name} className="group cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Icon className="h-8 w-8 text-gray-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6">
                    {category.description}
                  </p>
                  <Button 
                    onClick={() => router.push(category.href)}
                    className="w-full"
                  >
                    Browse Collection
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Featured Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Ajebo Tailor?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                Hand-selected fabrics and materials for lasting elegance
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
                <Shirt className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Tailoring</h3>
              <p className="text-gray-600">
                Perfect fit guaranteed with our expert tailoring services
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Service</h3>
              <p className="text-gray-600">
                Dedicated designer consultation for your unique style
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}