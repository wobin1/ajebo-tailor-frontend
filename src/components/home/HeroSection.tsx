'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative h-[70vh] md:h-[80vh] overflow-hidden bg-gray-100">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div className="relative w-full h-full bg-gradient-to-r from-gray-600 to-gray-800">
          {/* Placeholder for hero image - replace with actual image */}
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          
          {/* Hero Content */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white px-4 max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-wider mb-8 leading-tight">
                IN THE RIGHT OUTFIT
                <br />
                <span className="font-normal">ANYTHING IS POSSIBLE</span>
              </h1>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 border-white px-8 py-3 text-sm font-medium tracking-wider uppercase"
                >
                  Collections
                </Button>
                <Button 
                  size="lg"
                  className="bg-black text-white hover:bg-gray-900 px-8 py-3 text-sm font-medium tracking-wider uppercase"
                >
                  Shop Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Models positioned around the text */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left model */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1/4 h-full hidden lg:block">
          <div className="w-full h-full bg-gradient-to-r from-transparent to-gray-600 opacity-80" />
        </div>
        
        {/* Right model */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/4 h-full hidden lg:block">
          <div className="w-full h-full bg-gradient-to-l from-transparent to-gray-600 opacity-80" />
        </div>
      </div>
    </section>
  );
}
