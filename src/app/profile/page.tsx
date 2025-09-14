'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Package, Heart, Settings, LogOut, Edit2, MapPin, Plus } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { addressApi, Address, CreateAddressData } from '@/services/addressApi';
import { AddressCard } from '@/components/address/AddressCard';
import { AddressModal } from '@/components/address/AddressModal';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { data: orders = [], isLoading: isLoadingOrders, total: totalOrders, error: ordersError } = useOrders();
  
  // Debug logging
  console.log('Profile page - Orders data:', orders);
  console.log('Profile page - Loading state:', isLoadingOrders);
  console.log('Profile page - Total orders:', totalOrders);
  console.log('Profile page - Error:', ordersError);
  
  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>();
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

  // Load addresses on component mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
        const userAddresses = await addressApi.getUserAddresses();
        setAddresses(userAddresses);
      } catch (error) {
        console.error('Failed to load addresses:', error);
        toast.error('Failed to load addresses. Please try again.');
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    if (isAuthenticated && user) {
      fetchAddresses();
    }
  }, [isAuthenticated, user]);


  const handleAddAddress = () => {
    setEditingAddress(undefined);
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await addressApi.deleteAddress(addressId);
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      toast.success('Address deleted successfully.');
    } catch (error) {
      console.error('Failed to delete address:', error);
      toast.error('Failed to delete address. Please try again.');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await addressApi.updateAddress(addressId, { is_default: true });
      setAddresses(addresses.map(addr => ({
        ...addr,
        is_default: addr.id === addressId
      })));
      toast.success('Default address updated successfully.');
    } catch (error) {
      console.error('Failed to set default address:', error);
      toast.error('Failed to update default address. Please try again.');
    }
  };

  const handleSubmitAddress = async (data: CreateAddressData) => {
    try {
      setIsSubmittingAddress(true);
      if (editingAddress) {
        const updatedAddress = await addressApi.updateAddress(editingAddress.id, data);
        setAddresses(addresses.map(addr => 
          addr.id === editingAddress.id ? updatedAddress : addr
        ));
        toast.success('Address updated successfully.');
      } else {
        const newAddress = await addressApi.createAddress(data);
        setAddresses([...addresses, newAddress]);
        toast.success('Address added successfully.');
      }
    } catch (error) {
      console.error('Failed to save address:', error);
      toast.error('Failed to save address. Please try again.');
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
            <p className="text-gray-600 mb-8">You need to be logged in to view your profile.</p>
            <Button onClick={() => router.push('/auth/login')}>
              Log In
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const recentOrders = orders.slice(0, 3);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your account and view your order history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-gray-400" />
                </div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <p className="text-gray-600">{user.email}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/profile/edit')}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/orders')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Order History
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/profile/wishlist')}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/profile/settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleAddAddress}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Manage Addresses
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {isLoadingOrders ? '...' : totalOrders}
                    </div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {isLoadingOrders ? '...' : `$${orders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toFixed(2)}`}
                    </div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-600">Wishlist Items</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/orders')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading orders...</p>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                    <p className="text-gray-600 mb-4">You haven&apos;t placed any orders yet.</p>
                    <Button onClick={() => router.push('/products/all')}>
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div 
                        key={order.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        <div>
                          <p className="font-medium text-gray-900">Order #{order.order_number || order.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()} • {order.items_count || 0} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${order.total_amount?.toFixed(2) || '0.00'}</p>
                          <p className="text-sm text-gray-600 capitalize">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Addresses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Addresses</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddAddress}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingAddresses ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading addresses...</div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Addresses Yet</h3>
                    <p className="text-gray-600 mb-4">Add your first address to make checkout faster.</p>
                    <Button onClick={handleAddAddress}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <AddressCard
                        key={address.id}
                        address={address}
                        onEdit={handleEditAddress}
                        onDelete={handleDeleteAddress}
                        onSetDefault={handleSetDefaultAddress}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-16 justify-start"
                    onClick={() => router.push('/products/all')}
                  >
                    <div className="text-left">
                      <div className="font-medium">Continue Shopping</div>
                      <div className="text-sm text-gray-600">Browse our latest collection</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 justify-start"
                    onClick={() => router.push('/orders')}
                  >
                    <div className="text-left">
                      <div className="font-medium">Track Orders</div>
                      <div className="text-sm text-gray-600">Check your order status</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Address Modal */}
        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onSuccess={handleSubmitAddress}
          address={editingAddress}
          isLoading={isSubmittingAddress}
        />
      </div>
    </MainLayout>
  );
}
