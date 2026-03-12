'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { insforge } from '@/lib/insforge';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const EMAILJS_SERVICE_ID = 'service_5xji29m';
const EMAILJS_TEMPLATE_ID = 'template_tefqp3q';
const EMAILJS_PUBLIC_KEY = 'M0PmnIQHCsMjdF3kX';

export default function CheckoutModal({ onClose, onSuccess }: CheckoutModalProps) {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const product = items[0]?.products;
  const productName = product?.name || 'Unknown Product';
  const productPrice = product 
    ? (product.price * (1 - product.discount_percent / 100)).toFixed(2)
    : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !phone.trim() || !address.trim()) return;

    setIsSending(true);

    try {
      for (const item of items) {
        const product = item.products;
        const productName = product?.name || 'Unknown Product';
        const productPrice = product 
          ? Number((product.price * (1 - product.discount_percent / 100)).toFixed(2))
          : 0;

        const templateParams = {
          product_name: productName,
          product_price: productPrice.toFixed(2),
          fullname: user.name,
          email: user.email,
          phone: phone.trim(),
          address: address.trim(),
          order_time: new Date().toLocaleString(),
        };

        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY
        );

        await insforge.database.from('orders').insert([{
          user_id: user.id,
          product_id: item.product_id,
          product_name: productName,
          product_price: productPrice,
          fullname: user.name,
          email: user.email,
          phone: phone.trim(),
          address: address.trim(),
          status: 'pending',
          total_amount: productPrice * item.quantity,
        }]);
      }

      await clearCart();
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess();
      }, 3000);
    } catch (error) {
      console.error('Failed to send order:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            className="relative bg-gray-900 border border-green-500/30 rounded-2xl p-8 shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 10 }}
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  />
                </svg>
              </motion.div>
              <motion.h3
                className="text-2xl font-bold text-green-400"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Order Sent Successfully!
              </motion.h3>
              <motion.p
                className="text-gray-400 mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                We will contact you soon.
              </motion.p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            className="relative w-full max-w-lg bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-pink-500/10 pointer-events-none" />

            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  <span className="text-gradient">Checkout</span>
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white cursor-not-allowed opacity-70"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Price</label>
                  <input
                    type="text"
                    value={`$${productPrice}`}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white cursor-not-allowed opacity-70"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white cursor-not-allowed opacity-70"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white cursor-not-allowed opacity-70"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Address *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    placeholder="Enter your shipping address"
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSending || !phone.trim() || !address.trim()}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-pink-500 text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  whileHover={{ scale: isSending ? 1 : 1.02 }}
                  whileTap={{ scale: isSending ? 1 : 0.98 }}
                >
                  {isSending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Place Order'
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
