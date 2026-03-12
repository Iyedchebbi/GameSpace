'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CountdownTimer from '@/components/CountdownTimer';
import { insforge } from '@/lib/insforge';
import { Product } from '@/types';

export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const dealEndDate = new Date();
  dealEndDate.setDate(dealEndDate.getDate() + 3);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      const { data } = await insforge.database
        .from('products')
        .select('*')
        .eq('is_on_deal', true)
        .order('created_at', { ascending: false });

      if (data) {
        setProducts(data.map(p => ({
          ...p,
          image: p.image || '',
        })));
      }
      setLoading(false);
    };

    fetchDeals();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <section className="pt-32 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-gradient glow-text">🔥 Limited-Time Deals 🔥</span>
            </h1>
            <p className="text-xl text-gray-400">
              Grab these hot deals before they expire!
            </p>
          </motion.div>

          <motion.div
            className="flex justify-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-8 bg-gray-900/50 rounded-2xl border border-orange-500/30 glow-border">
              <p className="text-center text-orange-400 font-medium mb-4">DEALS END IN</p>
              <CountdownTimer targetDate={dealEndDate} />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No deals available at the moment</p>
              <p className="text-gray-500 mt-2">Check back soon for amazing offers!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
