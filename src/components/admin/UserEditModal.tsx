'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { updateUser, getAdminUser } from '@/services/adminApi';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string | null;
}

export default function UserEditModal({ isOpen, onClose, onSuccess, userId }: UserEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'customer' as 'customer' | 'designer' | 'admin',
    phone: '',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadUser = useCallback(async () => {
    if (!userId) return;
    
    setIsLoadingUser(true);
    try {
      const response = await getAdminUser(userId);
      const user = response.data;
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'customer',
        phone: user.profile?.phone || '',
        is_active: user.is_active
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load user';
      toast.error(errorMessage);
      onClose();
    } finally {
      setIsLoadingUser(false);
    }
  }, [userId, onClose]);

  useEffect(() => {
    if (isOpen && userId) {
      loadUser();
    }
  }, [isOpen, userId, loadUser]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await updateUser(userId, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone || undefined,
        is_active: formData.is_active
      });

      toast.success('User updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            Edit User
          </DialogTitle>
        </DialogHeader>

        {isLoadingUser ? (
          <div className="p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name *
              </Label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter full name"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address *
              </Label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number
              </Label>
              <div className="mt-1 relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="Enter phone number"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                Role
              </Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active User
              </Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked: boolean) => handleInputChange('is_active', checked)}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
