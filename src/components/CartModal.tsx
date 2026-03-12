'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import CheckoutModal from './CheckoutModal';

interface CartModalProps {
  onClose: () => void;
}

export default function CartModal({ onClose }: CartModalProps) {
  const { items, total, removeFromCart, updateQuantity, clearCart, loading } = useCart();
  const { user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    if (!user || items.length === 0) return;
    setShowCheckout(true);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative w-full max-w-md h-full bg-gray-900/95 border-l border-cyan-500/30 glow-border"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold">
              <span className="text-gradient">Your Cart</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                    >
                      <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-700">
                        {item.products?.image && (
                          <img
                            src={item.products.image}
                            alt={item.products?.name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-medium text-white truncate">
                          {item.products?.name}
                        </h3>
                        <p className="text-sm text-cyan-400">
                          ${item.products ? 
                            (item.products.price * (1 - item.products.discount_percent / 100)).toFixed(2) 
                            : '0.00'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-lg text-white hover:bg-gray-600"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-lg text-white hover:bg-gray-600"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Total:</span>
                <span className="text-2xl font-bold text-gradient">${total.toFixed(2)}</span>
              </div>

              <motion.button
                onClick={handleCheckout}
                disabled={!user}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-pink-500 text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {!user ? 'Sign in to Checkout' : 'Checkout'}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal
            onClose={() => setShowCheckout(false)}
            onSuccess={() => {
              setShowCheckout(false);
              onClose();
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
