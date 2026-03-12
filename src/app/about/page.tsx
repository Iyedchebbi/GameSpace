'use client';

import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const stats = [
  { value: '10K+', label: 'Happy Gamers' },
  { value: '500+', label: 'Products' },
  { value: '50+', label: 'Brands' },
  { value: '24/7', label: 'Support' },
];

const values = [
  {
    icon: '🎯',
    title: 'Quality First',
    description: 'Every product is handpicked and tested to ensure maximum performance',
  },
  {
    icon: '⚡',
    title: 'Speed Delivery',
    description: 'Lightning-fast shipping to get your gear when you need it',
  },
  {
    icon: '💎',
    title: 'Best Prices',
    description: 'Competitive pricing with exclusive deals and discounts',
  },
  {
    icon: '🤝',
    title: 'Community',
    description: 'Join thousands of gamers in our growing community',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-transparent to-pink-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0a0a0a_100%)]" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.span
              className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-medium mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              Who We Are
            </motion.span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient glow-text">GAMEZONE</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
              Your ultimate destination for premium gaming gear since 2024
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center p-6 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-cyan-500/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="text-gradient">Our Story</span>
              </h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Founded by passionate gamers, GAMEZONE started with a simple mission: to provide 
                  fellow gamers with the best equipment at unbeatable prices.
                </p>
                <p>
                  We believe that every gamer deserves the best gear to elevate their experience. 
                  Whether you're a competitive esports player or a casual gamer, we've got you covered.
                </p>
                <p>
                  Today, we're proud to serve thousands of gamers worldwide with our curated 
                  selection of premium gaming equipment.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gray-900/80 border border-gray-800 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  {values.slice(0, 4).map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="text-4xl mb-3">{item.icon}</div>
                      <div className="text-sm font-medium text-white">{item.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            className="p-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-gray-700 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-pink-500/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Level Up?
              </h2>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Explore our collection of premium gaming gear and find your perfect setup
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/store"
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-pink-500 text-black font-bold text-lg rounded-xl glow-button"
                >
                  Shop Now
                </a>
                <a
                  href="/deals"
                  className="px-8 py-4 border border-cyan-500/50 text-cyan-400 font-bold text-lg rounded-xl hover:bg-cyan-500/10 transition-colors"
                >
                  View Deals
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
