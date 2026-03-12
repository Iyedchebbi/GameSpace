'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SplineHero from '@/components/SplineHero';
import { insforge } from '@/lib/insforge';
import { Product } from '@/types';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await insforge.database
        .from('products')
        .select('*')
        .limit(4);
      
      if (data) {
        setFeaturedProducts(data.map(p => ({
          ...p,
          image: p.image || '',
        })));
      }
    };
    fetchFeatured();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />
      
      {/* Hero Section with Spline */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Spline 3D Background - Full Width */}
        <div className="absolute inset-0 z-0">
          <SplineHero />
        </div>

        {/* Hero Content - Centered */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 pt-16">
          <motion.div
            className="text-center max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <span className="text-gradient glow-text">Level Up Your Game</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto drop-shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            >
              Discover premium gaming gear that transforms your setup into the ultimate battle station
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            >
              <Link href="/store">
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-pink-500 text-black font-bold text-lg rounded-xl glow-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Shop Now
                </motion.button>
              </Link>
              <Link href="/deals">
                <motion.button
                  className="px-8 py-4 border border-cyan-500/50 text-cyan-400 font-bold text-lg rounded-xl hover:bg-cyan-500/10 transition-colors glow-border"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Deals
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ 
            opacity: { delay: 1, duration: 0.5 },
            y: { repeat: Infinity, duration: 2 }
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-cyan-400/60 uppercase tracking-widest">Scroll</span>
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Why Choose GAMEZONE?</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We bring you the latest gaming technology with unparalleled quality and style
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎮',
                title: 'Premium Quality',
                description: 'Handpicked gaming gear from top brands ensuring maximum performance',
              },
              {
                icon: '⚡',
                title: 'Fast Shipping',
                description: 'Lightning-fast delivery to get your gear when you need it most',
              },
              {
                icon: '🛡️',
                title: 'Secure Shopping',
                description: 'Your data is protected with enterprise-grade security',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="p-8 bg-gray-900/50 rounded-2xl border border-gray-800 glow-border"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 px-4 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Featured Gear</span>
            </h2>
            <p className="text-gray-400">Check out our top picks for your battle station</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className="group relative bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800 hover:border-cyan-500/50 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative aspect-square overflow-hidden">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-white truncate">{product.name}</h3>
                  <p className="text-cyan-400 font-bold">${product.price}</p>
                </div>
                <Link href="/store">
                  <div className="absolute inset-0 cursor-pointer" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/store">
              <motion.button
                className="px-8 py-3 border border-cyan-500/50 text-cyan-400 font-bold rounded-xl hover:bg-cyan-500/10 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All Products
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="p-12 bg-gradient-to-br from-cyan-950/50 via-gray-900 to-pink-950/50 rounded-3xl border border-gray-800"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to Level Up?
            </h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Join thousands of gamers who trust GAMEZONE for their gaming needs
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/store">
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-pink-500 text-black font-bold text-lg rounded-xl glow-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Shop Now
                </motion.button>
              </Link>
              <Link href="/about">
                <motion.button
                  className="px-8 py-4 border border-cyan-500/50 text-cyan-400 font-bold text-lg rounded-xl hover:bg-cyan-500/10 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
