'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Clock, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserOrders, updateOrderStatus, getOrder, Order } from '@/services/orderApi';
import { toast } from 'sonner';
import ProductDetailModal from '@/components/modals/ProductDetailModal';

export default function DesignerOrdersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch orders from backend
  const { data: ordersResponse, isLoading, error } = useQuery({
    queryKey: ['designer-orders', page, statusFilter, debouncedSearch],
    queryFn: () => getUserOrders({
      page,
      limit: 10,
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: debouncedSearch || undefined,
      sort_by: 'created_at',
      sort_order: 'desc'
    }),
    enabled: !!user
  });

  const orders = ordersResponse?.data || [];
  const pagination = ordersResponse?.meta?.pagination;

  // Fetch individual order details when modal is opened
  const { data: orderDetails, isLoading: isLoadingOrderDetails, error: orderDetailsError } = useQuery({
    queryKey: ['order-details', selectedOrderId],
    queryFn: () => getOrder(selectedOrderId!),
    enabled: !!selectedOrderId && isModalOpen,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Status update mutation
  const statusUpdateMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => 
      updateOrderStatus(orderId, status as Order['status']),
    onSuccess: () => {
      toast.success('Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['designer-orders'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order status');
    }
  });

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    statusUpdateMutation.mutate({ orderId, status: newStatus });
  };

  // Handle status filter change
  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1); // Reset to first page when filtering
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Modal handlers
  const handleViewOrder = (order: Order) => {
    setSelectedOrderId(order.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleModalStatusUpdate = (orderId: string, newStatus: string) => {
    statusUpdateMutation.mutate({ orderId, status: newStatus });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-2">Track and manage your tailoring orders</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders by ID, customer, or item..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
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
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading orders</h3>
            <p className="text-gray-600">{error.message}</p>
          </CardContent>
        </Card>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{order.order_number || order.id}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                    {/* Priority badge - only show if priority exists */}
                    {order.priority && (
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority} priority
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Customer</p>
                      <p className="text-gray-900">{order.customer_name || `${order.shipping_address?.firstName || ''} ${order.shipping_address?.lastName || ''}`.trim() || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{order.customer_email || order.shipping_address?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Items</p>
                      {order.items && order.items.length > 0 ? (
                        <>
                          {order.items.slice(0, 2).map((item, index) => (
                            <p key={index} className="text-gray-900">{item.product_name} (x{item.quantity})</p>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-sm text-gray-500">+{order.items.length - 2} more items</p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">No items</p>
                      )}
                      <p className="text-sm text-gray-500">Items: {order.items_count || (order.items?.length || 0)}</p>
                      <p className="text-sm text-gray-500">Total: ${order.total || order.total_amount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Order Date</p>
                      <p className="text-sm text-gray-700">{new Date(order.created_at).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">Updated: {new Date(order.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Payment & Shipping</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment:</span>
                        <span className="text-gray-900">{order.payment_method?.type || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">${order.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items:</span>
                        <span className="text-gray-900">{order.items_count || (order.items?.length || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 lg:ml-6">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewOrder(order)}
                    disabled={statusUpdateMutation.isPending}
                  >
                    {statusUpdateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
          
          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setPage(page - 1)}
                disabled={page <= 1 || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.current_page} of {pagination.total_pages} ({pagination.total} total)
              </span>
              <Button 
                variant="outline" 
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.total_pages || isLoading}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No orders found. Orders will appear here once customers place them.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        order={orderDetails?.data || null}
        onStatusUpdate={handleModalStatusUpdate}
        isUpdating={statusUpdateMutation.isPending}
        isLoading={isLoadingOrderDetails}
        error={orderDetailsError}
      />
    </div>
  );
}
