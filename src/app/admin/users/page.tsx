'use client';

import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, Eye, Plus, User, Mail, Phone, Users, UserCheck, Palette, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminUsers, updateUserRole, deleteUser } from '@/services/adminApi';
import { toast } from 'sonner';
import UserCreateModal from '@/components/admin/UserCreateModal';
import UserEditModal from '@/components/admin/UserEditModal';
import UserViewModal from '@/components/admin/UserViewModal';
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch users from backend
  const { data: usersResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', currentPage, searchTerm, roleFilter],
    queryFn: () => getAdminUsers({
      page: currentPage,
      limit: 20,
      search: searchTerm || undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      sort_by: 'created_at',
      sort_order: 'desc'
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const users = usersResponse?.data || [];
  const pagination = usersResponse?.meta?.pagination;

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'customer' | 'designer' | 'admin' }) => 
      updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('User role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user role';
      toast.error(errorMessage);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDeleteUserId(null);
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      toast.error(errorMessage);
    },
  });

  // Mock users data for fallback
  const mockUsers = [
    {
      id: 'USER-001',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      role: 'customer',
      status: 'active',
      joinDate: '2024-01-15',
      orders: 5,
      totalSpent: 1299.95
    },
    {
      id: 'USER-002',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567891',
      role: 'customer',
      status: 'active',
      joinDate: '2024-01-10',
      orders: 12,
      totalSpent: 2499.50
    },
    {
      id: 'USER-003',
      name: 'Designer User',
      email: 'designer@ajebo.com',
      phone: '+2348123456789',
      role: 'designer',
      status: 'active',
      joinDate: '2023-12-01',
      orders: 0,
      totalSpent: 0
    },
    {
      id: 'USER-004',
      name: 'Admin User',
      email: 'admin@ajebo.com',
      phone: '+2348123456788',
      role: 'admin',
      status: 'active',
      joinDate: '2023-11-01',
      orders: 0,
      totalSpent: 0
    },
    {
      id: 'USER-005',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+1234567892',
      role: 'customer',
      status: 'inactive',
      joinDate: '2023-12-20',
      orders: 2,
      totalSpent: 189.99
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'designer': return 'bg-purple-100 text-purple-800';
      case 'customer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setEditUserId(null);
    setViewUserId(null);
    setDeleteUserId(null);
    // Refresh data after modal operations
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const handleViewUser = (userId: string) => {
    setViewUserId(userId);
  };

  const handleConfirmDelete = () => {
    if (deleteUserId) {
      deleteUserMutation.mutate(deleteUserId);
    }
  };

  const handleRoleUpdate = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole as 'customer' | 'designer' | 'admin' });
  };

  // Use backend data if available, otherwise use mock data for display
  const displayUsers = users.length > 0 ? users : mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 w-full max-w-none overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Users</p>
                <p className="text-xl font-bold text-gray-900">{displayUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Active Users</p>
                <p className="text-xl font-bold text-gray-900">
                  {displayUsers.filter(user => 'is_active' in user ? user.is_active : user.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Palette className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Designers</p>
                <p className="text-xl font-bold text-gray-900">
                  {displayUsers.filter(user => user.role === 'designer').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Admins</p>
                <p className="text-xl font-bold text-gray-900">
                  {displayUsers.filter(user => user.role === 'admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customer</option>
                <option value="designer">Designer</option>
                <option value="admin">Admin</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load users</h3>
            <Button onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Users ({displayUsers.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-medium text-gray-900 w-1/4">User</th>
                      <th className="text-left p-3 font-medium text-gray-900 w-1/4 hidden md:table-cell">Contact</th>
                      <th className="text-left p-3 font-medium text-gray-900 w-20">Role</th>
                      <th className="text-left p-3 font-medium text-gray-900 w-16">Status</th>
                      <th className="text-left p-3 font-medium text-gray-900 w-16 hidden lg:table-cell">Orders</th>
                      <th className="text-left p-3 font-medium text-gray-900 w-20 hidden lg:table-cell">Total</th>
                      <th className="text-left p-3 font-medium text-gray-900 w-20 hidden xl:table-cell">Date</th>
                      <th className="text-left p-3 font-medium text-gray-900 w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center min-w-0">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="ml-2 min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">{user.name}</div>
                          <div className="text-xs text-gray-500 truncate">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <div className="flex flex-col space-y-1 min-w-0">
                        <div className="flex items-center text-xs text-gray-600 min-w-0">
                          <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600 min-w-0">
                          <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{'phone' in user ? user.phone : 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                        className={`px-1 py-1 text-xs font-medium rounded border-0 w-full ${getRoleColor(user.role)}`}
                      >
                        <option value="customer">Customer</option>
                        <option value="designer">Designer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <Badge className={`text-xs ${getStatusColor('status' in user ? user.status : ('is_active' in user && user.is_active ? 'active' : 'inactive'))}`}>
                        {'status' in user ? user.status : ('is_active' in user && user.is_active ? 'active' : 'inactive')}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-gray-900 hidden lg:table-cell">
                      {'orders' in user ? user.orders : 0}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <div className="text-xs font-medium text-gray-900">
                        ${'totalSpent' in user ? user.totalSpent : 0}
                      </div>
                    </td>
                    <td className="p-3 text-xs text-gray-500 hidden xl:table-cell">
                      {'joinDate' in user ? user.joinDate : ('created_at' in user ? new Date(user.created_at).toLocaleDateString() : 'N/A')}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewUser(user.id)}
                          title="View user details"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditUserId(user.id)}
                          title="Edit user"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete user"
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-500">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                {pagination.total} users
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
                  disabled={currentPage === pagination.total_pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Management Modals */}
      <UserCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalClose}
      />

      <UserEditModal
        isOpen={!!editUserId}
        userId={editUserId}
        onClose={handleModalClose}
        onSuccess={handleModalClose}
      />

      <UserViewModal
        isOpen={!!viewUserId}
        userId={viewUserId}
        onClose={handleModalClose}
      />

      <DeleteConfirmModal
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete this user? This action cannot be undone and will permanently remove the user from the system.`}
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}
