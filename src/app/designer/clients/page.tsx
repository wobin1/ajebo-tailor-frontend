'use client';

import React from 'react';
import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function DesignerClientsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Construction className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
            <p className="text-gray-600">
              The client management feature is currently under development. 
              Check back soon for updates!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
