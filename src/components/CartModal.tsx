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
                  {items.map((item) => {
                    const productPrice = item.products?.price || 0;
                    const discountPercent = item.products?.discount_percent || 0;
                    const finalPrice = productPrice * (1 - discountPercent / 100);
                    const itemSubtotal = finalPrice * item.quantity;
                    
                    return (
                      <motion.div
                        key={item.id}
                        className="group relative bg-gray-800/40 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                      >
                        <div className="flex p-3 gap-3">
                          {/* Product Image */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-700">
                            {item.products?.image ? (
                              <img
                                src={item.products.image}
                                alt={item.products?.name || 'Product'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            {discountPercent > 0 && (
                              <div className="absolute top-1 left-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                                -{discountPercent}%
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                            <div>
                              <h3 className="font-semibold text-white text-sm sm:text-base truncate leading-tight">
                                {item.products?.name || 'Product'}
                              </h3>
                              <p className="text-xs text-gray-400 mt-1">
                                {item.products?.category || 'Gaming'}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              {/* Price */}
                              <div className="flex flex-col">
                                {discountPercent > 0 && (
                                  <span className="text-xs text-gray-500 line-through">
                                    ${productPrice.toFixed(2)}
                                  </span>
                                )}
                                <span className="text-cyan-400 font-bold text-sm">
                                  ${finalPrice.toFixed(2)}
                                </span>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-1 sm:gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-700/50 rounded-lg text-white hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="w-8 text-center text-white font-medium text-sm">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-700/50 rounded-lg text-white hover:bg-gray-600 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Delete Button & Subtotal */}
                          <div className="flex flex-col items-end justify-between">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Remove item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            <span className="text-white font-bold text-sm">
                              ${itemSubtotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-gray-800 bg-gray-900/50">
              {/* Summary */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Items ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span className="text-white">${total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="border-t border-gray-700 pt-2 flex items-center justify-between">
                  <span className="text-gray-300 font-medium">Total</span>
                  <span className="text-2xl font-bold text-gradient">${total.toFixed(2)}</span>
                </div>
              </div>

              <motion.button
                onClick={handleCheckout}
                disabled={!user}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-pink-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {!user ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign in to Checkout
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Proceed to Checkout
                  </>
                )}
              </motion.button>

              <button
                onClick={clearCart}
                className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
              >
                Clear Cart
              </button>
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
