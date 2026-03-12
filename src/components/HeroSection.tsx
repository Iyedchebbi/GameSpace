'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  showSpline?: boolean;
  ctaButtons?: React.ReactNode;
}

export default function HeroSection({ title, subtitle, showSpline = false, ctaButtons }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {showSpline && (
        <div className="absolute inset-0 z-0">
          <div className="spline-overlay" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a] z-10" />

      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto mt-20">
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="text-gradient glow-text">{title}</span>
        </motion.h1>

        {subtitle && (
          <motion.p
            className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            {subtitle}
          </motion.p>
        )}

        {ctaButtons && (
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          >
            {ctaButtons}
          </motion.div>
        )}

        {!ctaButtons && (
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
        )}
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ 
          opacity: { delay: 1, duration: 0.5 },
          y: { repeat: Infinity, duration: 2 }
        }}
      >
        <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}
