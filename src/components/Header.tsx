'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useCartModal } from '@/hooks/useCartModal';
import AuthModal from './AuthModal';
import CartModal from './CartModal';
import ProfileModal from './ProfileModal';

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const { itemCount } = useCart();
  const { isOpen: showAuthModal, mode: authMode, openModal, closeModal } = useAuthModal();
  const { isOpen: showCartModal, openCartModal, closeCartModal } = useCartModal();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openSignIn = () => openModal('signin');
  const openSignUp = () => openModal('signup');

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-nav">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-2">
                <motion.div className="text-2xl font-bold glow-text" whileHover={{ scale: 1.05 }}>
                  <span className="text-gradient">GAMEZONE</span>
                </motion.div>
              </Link>

              <nav className="hidden md:flex items-center space-x-8">
                {['Home', 'Store', 'Deals', 'About'].map((item) => (
                  <Link key={item} href={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="text-gray-300 hover:text-cyan-400 transition-colors duration-200 font-medium">
                    {item}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center space-x-4">
                <button onClick={openCartModal} className="relative p-2 text-gray-300 hover:text-cyan-400 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-cyan-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{itemCount}</span>
                  )}
                </button>

                {!loading && (
                  user ? (
                    <div className="relative" ref={menuRef}>
                      <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 flex items-center justify-center text-black font-bold text-sm">
                            {user.name ? getInitials(user.name) : user.email[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-300 hidden sm:block">{user.name || user.email.split('@')[0]}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <AnimatePresence>
                        {showUserMenu && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-56 bg-gray-900/95 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-3 border-b border-gray-700">
                              <p className="text-sm font-medium text-white truncate">{user.name || 'User'}</p>
                              <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                            <div className="py-1">
                              <Link href="/orders" onClick={() => setShowUserMenu(false)} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                My Orders
                              </Link>
                              <button onClick={() => { setShowUserMenu(false); setShowProfileModal(true); }} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Edit Profile
                              </button>
                              <button onClick={handleSignOut} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Sign Out
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <>
                      <button onClick={openSignIn} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Sign In</button>
                      <motion.button onClick={openSignUp} className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-cyan-500 to-pink-500 text-black rounded-lg hover:opacity-90 transition-opacity" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        Sign Up
                      </motion.button>
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showAuthModal && <AuthModal mode={authMode} onModeChange={(mode) => openModal(mode)} onClose={closeModal} />}
      </AnimatePresence>

      <AnimatePresence>
        {showCartModal && <CartModal onClose={closeCartModal} />}
      </AnimatePresence>

      <AnimatePresence>
        {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
      </AnimatePresence>
    </>
  );
}
