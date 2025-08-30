'use client';

import React from 'react';
import { Scissors, Clock, Users, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DesignerDashboard() {
  const stats = [
    {
      title: 'Active Orders',
      value: '23',
      icon: Scissors,
      change: '+5 new',
      changeType: 'positive' as const,
    },
    {
      title: 'Pending Measurements',
      value: '8',
      icon: Clock,
      change: '2 urgent',
      changeType: 'warning' as const,
    },
    {
      title: 'Total Clients',
      value: '156',
      icon: Users,
      change: '+12 this month',
      changeType: 'positive' as const,
    },
    {
      title: 'WhatsApp Chats',
      value: '45',
      icon: MessageCircle,
      change: '12 unread',
      changeType: 'info' as const,
    },
  ];

  const recentOrders = [
    { id: '001', client: 'John Doe', item: 'Custom Suit', status: 'In Progress', dueDate: '2024-01-15' },
    { id: '002', client: 'Jane Smith', item: 'Wedding Dress', status: 'Measurements', dueDate: '2024-01-20' },
    { id: '003', client: 'Mike Johnson', item: 'Casual Shirt', status: 'Ready', dueDate: '2024-01-10' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Measurements': return 'bg-yellow-100 text-yellow-800';
      case 'Ready': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Designer Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your tailoring orders and client communications</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">#{order.id} - {order.client}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.item}</p>
                    <p className="text-xs text-gray-500 mt-1">Due: {order.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Scissors className="h-4 w-4 mr-2" />
                Create New Order
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Schedule Fitting
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Add New Client
              </Button>
              <Button className="w-full justify-start bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                <MessageCircle className="h-4 w-4 mr-2" />
                Open WhatsApp Business
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Today&apos;s Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div>
                <p className="font-medium text-blue-900">10:00 AM - Fitting Appointment</p>
                <p className="text-sm text-blue-700">John Doe - Custom Suit measurements</p>
              </div>
              <Button size="sm" variant="outline">
                Mark Complete
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <div>
                <p className="font-medium text-yellow-900">2:00 PM - Delivery</p>
                <p className="text-sm text-yellow-700">Mike Johnson - Casual Shirt pickup</p>
              </div>
              <Button size="sm" variant="outline">
                Mark Complete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
