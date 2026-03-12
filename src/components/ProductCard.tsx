'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState } from 'react';
import { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useCartModal } from '@/hooks/useCartModal';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

export default function ProductCard({ product, showAddToCart = true }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { openModal } = useAuthModal();
  const { openCartModal } = useCartModal();
  const [isAdding, setIsAdding] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleAddToCart = async () => {
    if (!user) {
      openModal('signup');
      return;
    }
    setIsAdding(true);
    await addToCart(product.id);
    showToast(`${product.name} added to cart!`, 'success');
    openCartModal();
    setIsAdding(false);
  };

  const discountedPrice = product.price * (1 - product.discount_percent / 100);

  return (
    <motion.div
      className="relative group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="relative bg-gray-900/80 rounded-2xl overflow-hidden border border-gray-800 glow-border"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="relative aspect-square overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {product.is_on_deal && product.discount_percent > 0 && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-black font-bold text-sm rounded-full glow-badge">
              -{product.discount_percent}%
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-4">
          <p className="text-xs text-cyan-400 uppercase tracking-wider mb-1">
            {product.category}
          </p>
          <h3 className="text-lg font-bold text-white mb-2 truncate">
            {product.name}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gradient">
                ${discountedPrice.toFixed(2)}
              </span>
              {product.is_on_deal && product.discount_percent > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {showAddToCart && (
              <motion.button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-black font-medium text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 glow-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
