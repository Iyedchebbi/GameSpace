'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';

const ADMIN_EMAILS = ['admin-space@gmail.com', 'iyedchebbi18@gmail.com', 'adminadmin@gmail.com', 'miladicode1379@gmail.com'];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: authUser, loading, signIn } = useAuth();
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const user = adminUser || authUser;

  useEffect(() => {
    if (!loading && user) {
      const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
      if (!isAdmin) {
        router.replace('/');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && !user) {
      setShowLoginForm(true);
    }
  }, [loading, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoggingIn(true);

    // Check if email is admin email
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      setError('Access denied. Admin email required.');
      setLoggingIn(false);
      return;
    }

    // Try InsForge auth first
    const { error: loginError } = await signIn(email, password);
    
    if (!loginError) {
      // InsForge login successful
      setLoggingIn(false);
      return;
    }
    
    // If password auth fails, try to get session from auth - user might have signed in with Google
    try {
      const { data: sessionData } = await import('@/lib/insforge').then(m => 
        m.insforge.auth.getCurrentSession()
      );
      
      if (sessionData?.session?.user) {
        // User is authenticated via OAuth (e.g., Google)
        const { insforge } = await import('@/lib/insforge');
        const { data: adminData } = await insforge.database
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase())
          .single();

        if (adminData || ADMIN_EMAILS.includes(email.toLowerCase())) {
          sessionStorage.setItem('adminUser', JSON.stringify({
            id: sessionData.session.user.id,
            email: email.toLowerCase(),
            name: sessionData.session.user.profile?.name || 'Admin'
          }));
          setLoggingIn(false);
          window.location.href = '/admin';
          return;
        }
      }
    } catch (sessionErr) {
      console.log('No active session');
    }
    
    // If InsForge auth fails, check for hardcoded admin credentials
    if (email.toLowerCase() === 'admin-space@gmail.com' && password === 'admin123') {
      // Fetch admin user from database
      const { insforge } = await import('@/lib/insforge');
      const { data: adminData } = await insforge.database
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (adminData) {
        // Store admin session in sessionStorage
        sessionStorage.setItem('adminUser', JSON.stringify(adminData));
        setAdminUser(adminData);
        setLoggingIn(false);
        window.location.href = '/admin';
        return;
      }
      
      // Create admin user if not exists
      const admin: User = {
        id: 'admin-001',
        email: 'admin-space@gmail.com',
        name: 'Admin',
        created_at: new Date().toISOString(),
      };
      sessionStorage.setItem('adminUser', JSON.stringify(admin));
      setAdminUser(admin);
      setLoggingIn(false);
      window.location.href = '/admin';
      return;
    }
    
    setError(loginError);
    setLoggingIn(false);
  };

  // Check for admin session on mount
  useEffect(() => {
    const storedAdmin = sessionStorage.getItem('adminUser');
    if (storedAdmin && !authUser) {
      try {
        const adminData = JSON.parse(storedAdmin);
        if (ADMIN_EMAILS.includes(adminData.email?.toLowerCase())) {
          setAdminUser(adminData);
        }
      } catch (e) {
        sessionStorage.removeItem('adminUser');
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && showLoginForm) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-2 glow-text">
              <span className="text-gradient">ADMIN</span>
            </h1>
            <p className="text-gray-400 text-lg">Sign in to access the admin dashboard</p>
          </div>

          <motion.div
            className="p-8 rounded-3xl bg-gray-900/90 border border-cyan-500/30 glow-border"
          >
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white transition-all"
                  placeholder="adminadmin@gmail.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white transition-all"
                  placeholder="iyed123"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loggingIn}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-pink-500 text-black font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loggingIn ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!ADMIN_EMAILS.includes(user?.email?.toLowerCase() || '')) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Access denied. Admin only.</p>
          <p className="text-gray-500 text-sm mb-4">Your email: {user?.email}</p>
          <Link href="/" className="text-cyan-400 hover:text-cyan-300">Go to Home</Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'All Products', href: '/admin', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { name: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { name: 'Add Product', href: '/admin/add-product', icon: 'M12 4v16m8-8H4' },
    { name: 'Settings', href: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-screen bg-gray-900/95 border-r border-gray-800 z-40 flex flex-col"
      >
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin">
            <motion.div
              className="text-2xl font-bold glow-text cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-gradient">ADMIN</span>
            </motion.div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border border-cyan-500/30'
                      : 'hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {sidebarOpen && (
                    <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      {item.name}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {sidebarOpen && <span className="font-medium">Home</span>}
          </Link>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </motion.aside>

      <main
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}
      >
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
