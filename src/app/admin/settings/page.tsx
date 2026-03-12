'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';

const ADMIN_EMAILS = ['admin-space@gmail.com', 'iyedchebbi18@gmail.com', 'adminadmin@gmail.com', 'miladicode1379@gmail.com'];

export default function AdminSettings() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    // Check sessionStorage for admin user
    const storedAdmin = sessionStorage.getItem('adminUser');
    if (storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        if (ADMIN_EMAILS.includes(adminData.email?.toLowerCase())) {
          setUser(adminData);
        }
      } catch (e) {
        sessionStorage.removeItem('adminUser');
      }
    }
  }, []);

  useEffect(() => {
    if (authUser && ADMIN_EMAILS.includes(authUser.email.toLowerCase())) {
      setUser(authUser);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchStats();
    } else if (!authLoading && !user) {
      // Delay redirect to allow sessionStorage to be checked
      const timer = setTimeout(() => {
        const storedAdmin = sessionStorage.getItem('adminUser');
        if (!storedAdmin) {
          router.push('/admin');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, router]);

  const fetchStats = async () => {
    const { insforge } = await import('@/lib/insforge');
    
    const [productsRes, ordersRes, usersRes] = await Promise.all([
      insforge.database.from('products').select('id', { count: 'exact', head: true }),
      insforge.database.from('orders').select('id', { count: 'exact', head: true }),
      insforge.database.from('users').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      totalProducts: productsRes.count || 0,
      totalOrders: ordersRes.count || 0,
      totalUsers: usersRes.count || 0,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-gradient">Settings</span>
        </h1>
        <p className="text-gray-400">Manage your admin dashboard</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.totalProducts}</p>
                <p className="text-gray-400">Total Products</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-pink-500/30 transition-colors"
        >
          <Link href="/admin/orders" className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
                <p className="text-gray-400">Total Orders</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-pink-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-gradient" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
              <p className="text-gray-400">Total Users</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl"
      >
        <h2 className="text-xl font-bold text-white mb-4">Admin Information</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <span className="text-gray-400">Admin Email</span>
            <span className="text-white font-medium">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <span className="text-gray-400">Access Level</span>
            <span className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-medium">
              Full Access
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-400">Dashboard Status</span>
            <span className="flex items-center gap-2 text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Active
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
