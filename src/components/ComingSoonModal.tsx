import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export function ComingSoonModal({ isOpen, onClose, featureName }: ComingSoonModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Sparkles className="h-8 w-8 text-blue-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            {featureName} Coming Soon!
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            We&apos;re working hard to bring you this exciting feature. Stay tuned for updates!
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">In Development</p>
                <p className="text-xs text-gray-500">
                  This feature is currently being developed and will be available soon.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={onClose} className="w-full">
              Got it, thanks!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
