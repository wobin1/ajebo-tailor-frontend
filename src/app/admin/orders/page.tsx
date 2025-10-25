'use client';

import React, { useState } from 'react';
import { Search, Eye, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminOrders, getAdminOrder, updateOrder, deleteOrder } from '@/services/adminApi';
import { toast } from 'sonner';
import ViewOrderModal from '@/components/admin/ViewOrderModal';
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal';

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch orders from backend
  const {
    data: ordersResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-orders', { 
      page: currentPage, 
      limit: 20, 
      status: statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      payment_status: paymentStatusFilter !== 'all' ? paymentStatusFilter : undefined,
      search: searchTerm || undefined,
      sort_by: 'created_at',
      sort_order: 'desc'
    }],
    queryFn: () => getAdminOrders({ 
      page: currentPage, 
      limit: 20, 
      status: statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      payment_status: paymentStatusFilter !== 'all' ? paymentStatusFilter : undefined,
      search: searchTerm || undefined,
      sort_by: 'created_at',
      sort_order: 'desc'
    }),
    staleTime: 30 * 1000, // 30 seconds
  });

  // Mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => 
      updateOrder(orderId, { status: status as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' }),
    onSuccess: () => {
      toast.success('Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order status');
    },
  });

  // Mutation for deleting order
  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: string) => deleteOrder(orderId),
    onSuccess: () => {
      toast.success('Order cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setShowDeleteModal(false);
      setOrderToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel order');
    },
  });

  // Fetch specific order for view modal
  const {
    data: selectedOrderResponse,
    isLoading: isOrderLoading,
  } = useQuery({
    queryKey: ['admin-order', selectedOrderId],
    queryFn: () => selectedOrderId ? getAdminOrder(selectedOrderId) : null,
    enabled: !!selectedOrderId && showViewModal,
  });

  const orders = ordersResponse?.data || [];
  const pagination = ordersResponse?.meta?.pagination;
  const selectedOrder = selectedOrderResponse?.data || null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setShowDeleteModal(true);
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      deleteOrderMutation.mutate(orderToDelete);
    }
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedOrderId(null);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all customer orders</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders by ID, customer, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Payment</option>
                <option value="pending">Payment Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load orders</p>
              <Button onClick={() => refetch()} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-gray-900">Order ID</th>
                    <th className="text-left p-4 font-medium text-gray-900">Customer</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Priority</th>
                    <th className="text-left p-4 font-medium text-gray-900">Items</th>
                    <th className="text-left p-4 font-medium text-gray-900">Total</th>
                    <th className="text-left p-4 font-medium text-gray-900">Date</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">
                          #{order.order_number || order.id.slice(-6)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.customer_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer_email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(order.status)}`}
                          disabled={updateStatusMutation.isPending}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(order.priority)}`}>
                          {order.priority ? order.priority.charAt(0).toUpperCase() + order.priority.slice(1) : 'Medium'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900">
                        {order.items_count || order.items?.length || 0}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">
                          ${order.total.toFixed(2)}
                        </div>
                      </td>
                      <td className="p-4 text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewOrder(order.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={deleteOrderMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                {pagination.total} orders
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
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
        </CardContent>
      </Card>

      {/* View Order Modal */}
      <ViewOrderModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        order={selectedOrder}
        isLoading={isOrderLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setOrderToDelete(null);
        }}
        onConfirm={confirmDeleteOrder}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action will set the order status to cancelled."
        confirmText={deleteOrderMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
        isLoading={deleteOrderMutation.isPending}
      />
    </div>
  );
}
