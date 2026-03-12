'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import emailjs from '@emailjs/browser';
import { useAuth } from '@/hooks/useAuth';
import { insforge } from '@/lib/insforge';
import { Order, User } from '@/types';

const EMAILJS_SERVICE_ID = 'service_5xji29m';
const EMAILJS_TEMPLATE_ID = 'template_order_update';
const EMAILJS_PUBLIC_KEY = 'M0PmnIQHCsMjdF3kX';

const ADMIN_EMAILS = ['admin-space@gmail.com', 'iyedchebbi18@gmail.com', 'adminadmin@gmail.com', 'miladicode1379@gmail.com'];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [adminUser, setAdminUser] = useState<User | null>(null);

  const isAdmin = adminUser && ADMIN_EMAILS.includes(adminUser.email?.toLowerCase());
  const isAuthAdmin = authUser && ADMIN_EMAILS.includes(authUser.email?.toLowerCase());

  useEffect(() => {
    const storedAdmin = sessionStorage.getItem('adminUser');
    if (storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        if (ADMIN_EMAILS.includes(adminData.email?.toLowerCase())) {
          setAdminUser(adminData);
        }
      } catch (e) {
        console.error('Failed to parse admin user');
      }
    }
  }, []);

  const fetchOrders = async () => {
    let query = insforge.database
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setOrders(data);
    } else if (error) {
      console.error('Error fetching orders:', error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string, order?: Order) => {
    setUpdatingId(orderId);
    
    const { error: updateError } = await insforge.database
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError.message);
      setUpdatingId(null);
      return;
    }

    if (order?.email && order.fullname && order.product_name) {
      try {
        const statusMessages: Record<string, { subject: string; message: string }> = {
          confirmed: {
            subject: 'Your Order Has Been Confirmed!',
            message: 'Great news! Your order has been confirmed and is being processed.',
          },
          shipped: {
            subject: 'Your Order Has Been Shipped!',
            message: 'Your order is on its way! You will receive it soon.',
          },
          delivered: {
            subject: 'Your Order Has Been Delivered!',
            message: 'Your order has been delivered. Thank you for your purchase!',
          },
          cancelled: {
            subject: 'Your Order Has Been Cancelled',
            message: 'Unfortunately, your order has been cancelled. Please contact support for more information.',
          },
        };

        const statusInfo = statusMessages[newStatus];
        if (statusInfo) {
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
              to_email: order.email,
              to_name: order.fullname,
              product_name: order.product_name,
              order_status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
              status_message: statusInfo.message,
              order_date: new Date(order.created_at).toLocaleDateString(),
            },
            EMAILJS_PUBLIC_KEY
          ).catch(() => {
            console.log('Email template may need to be configured');
          });
        }
      } catch (error) {
        console.log('Email notification skipped');
      }
    }

    await fetchOrders();
    setUpdatingId(null);
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrder) return;
    
    await insforge.database.from('orders').delete().eq('id', deleteOrder.id);
    setDeleteOrder(null);
    await fetchOrders();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-gradient">Orders Management</span>
          </h1>
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Link
              href="/admin"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Admin
            </Link>
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 text-gray-400 font-medium">Order ID</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Product</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Customer</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Email</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Phone</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Price</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 text-gray-300 text-sm font-mono">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="p-4 text-white font-medium max-w-[150px] truncate">
                      {order.product_name || 'N/A'}
                    </td>
                    <td className="p-4 text-gray-300">
                      {order.fullname || 'N/A'}
                    </td>
                    <td className="p-4 text-gray-300 text-sm">
                      {order.email || 'N/A'}
                    </td>
                    <td className="p-4 text-gray-300 text-sm">
                      {order.phone || 'N/A'}
                    </td>
                    <td className="p-4 text-cyan-400 font-bold">
                      ${Number(order.product_price || order.total_amount).toFixed(2)}
                    </td>
                    <td className="p-4">
                      {updatingId === order.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-cyan-500" />
                      ) : order.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(order.id, 'confirmed', order)}
                            className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm hover:bg-green-500/30 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(order.id, 'cancelled', order)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm hover:bg-red-500/30 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value, order)}
                          className={`px-3 py-1 rounded-full text-sm border cursor-pointer ${statusColors[order.status] || statusColors.pending}`}
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status} className="bg-gray-900">
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteOrder(order)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No orders found
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
            <motion.div
              className="relative w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Order ID</label>
                  <p className="text-white font-mono text-sm">{selectedOrder.id}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Product Name</label>
                  <p className="text-white">{selectedOrder.product_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Price</label>
                  <p className="text-cyan-400 font-bold">${Number(selectedOrder.product_price || selectedOrder.total_amount).toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Customer Name</label>
                  <p className="text-white">{selectedOrder.fullname || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white">{selectedOrder.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Phone</label>
                  <p className="text-white">{selectedOrder.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Address</label>
                  <p className="text-white">{selectedOrder.address || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  {selectedOrder.status === 'pending' ? (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleStatusChange(selectedOrder.id, 'confirmed', selectedOrder)}
                        className="flex-1 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedOrder.id, 'cancelled', selectedOrder)}
                        className="flex-1 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <select
                      value={selectedOrder.status}
                      onChange={async (e) => {
                        await handleStatusChange(selectedOrder.id, e.target.value, selectedOrder);
                        setSelectedOrder({ ...selectedOrder, status: e.target.value as Order['status'] });
                      }}
                      className={`mt-1 px-3 py-2 rounded-lg text-sm border cursor-pointer w-full ${statusColors[selectedOrder.status] || statusColors.pending}`}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status} className="bg-gray-900">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-400">Order Date</label>
                  <p className="text-white">
                    {new Date(selectedOrder.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteOrder && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteOrder(null)} />
            <motion.div
              className="relative w-full max-w-md bg-gray-900 border border-red-500/30 rounded-2xl p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-xl font-bold text-white mb-4">Delete Order</h2>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this order? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteOrder(null)}
                  className="flex-1 py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOrder}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
