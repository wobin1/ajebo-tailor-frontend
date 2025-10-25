'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, Calendar, ShoppingBag, DollarSign, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getAdminUser } from '@/services/adminApi';

interface UserViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  profile?: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  order_count?: number;
  total_spent?: number;
  completed_orders?: number;
  completed_spent?: number;
}

export default function UserViewModal({ isOpen, onClose, userId }: UserViewModalProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadUser = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await getAdminUser(userId);
      setUserData(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load user';
      toast.error(errorMessage);
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [userId, onClose]);

  useEffect(() => {
    if (isOpen && userId) {
      loadUser();
    }
  }, [isOpen, userId, loadUser]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'designer': return 'bg-purple-100 text-purple-800';
      case 'customer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'designer': return <User className="h-4 w-4" />;
      case 'customer': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            User Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : userData ? (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-start justify-between p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{userData.name}</h3>
                  <p className="text-gray-600">{userData.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getRoleColor(userData.role)}>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(userData.role)}
                        {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                      </div>
                    </Badge>
                    <Badge className={userData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      <div className="flex items-center gap-1">
                        {userData.is_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {userData.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </Badge>
                    <Badge className={userData.email_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {userData.email_verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>User ID: {userData.id}</p>
                <p>Joined: {new Date(userData.created_at).toLocaleDateString()}</p>
                <p>Updated: {new Date(userData.updated_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-xl font-bold">{userData.order_count || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completed Orders</p>
                      <p className="text-xl font-bold">{userData.completed_orders || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-xl font-bold">${userData.total_spent?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <DollarSign className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completed Spent</p>
                      <p className="text-xl font-bold">${userData.completed_spent?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact & Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{userData.profile?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">
                      {userData.profile?.address ? (
                        <>
                          {userData.profile.address}
                          {userData.profile.city && `, ${userData.profile.city}`}
                          {userData.profile.state && `, ${userData.profile.state}`}
                          {userData.profile.postal_code && ` ${userData.profile.postal_code}`}
                          {userData.profile.country && `, ${userData.profile.country}`}
                        </>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={userData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {userData.is_active ? 'Active Account' : 'Inactive Account'}
                      </Badge>
                      <Badge className={userData.email_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {userData.email_verified ? 'Email Verified' : 'Email Not Verified'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Account Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Account Created</p>
                        <p className="text-sm text-gray-600">User joined the platform</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(userData.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Last Updated</p>
                        <p className="text-sm text-gray-600">Profile information modified</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(userData.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="p-8 text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
            <p className="text-gray-600">The requested user could not be loaded.</p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
