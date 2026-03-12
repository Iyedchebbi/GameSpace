'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';
import { insforge, PRODUCTS_BUCKET } from '@/lib/insforge';
import { useToast } from '@/hooks/useToast';

const ADMIN_EMAILS = ['admin-space@gmail.com', 'iyedchebbi18@gmail.com', 'adminadmin@gmail.com', 'miladicode1379@gmail.com'];

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  is_on_deal: boolean;
  discount_percent: string;
}

export default function AddProduct() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    is_on_deal: false,
    discount_percent: '0',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check sessionStorage for admin user
    const storedAdmin = sessionStorage.getItem('adminUser');
    if (storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        if (ADMIN_EMAILS.includes(adminData.email?.toLowerCase())) {
          setUser(adminData);
        }
      } catch (e) {
        sessionStorage.removeItem('adminUser');
      }
    }
  }, []);

  useEffect(() => {
    if (authUser && ADMIN_EMAILS.includes(authUser.email.toLowerCase())) {
      setUser(authUser);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authLoading && user) {
      // User is authorized - stay on page
    } else if (!authLoading && !user) {
      // Delay redirect to allow sessionStorage to be checked
      const timer = setTimeout(() => {
        const storedAdmin = sessionStorage.getItem('adminUser');
        if (!storedAdmin) {
          router.push('/admin');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl: string | null = null;

      if (image) {
        const fileName = `${Date.now()}-${image.name.replace(/\s/g, '-')}`;
        
        const { data, error: uploadError } = await insforge.storage
          .from(PRODUCTS_BUCKET)
          .upload(fileName, image);

        if (uploadError) {
          showToast('Failed to upload image: ' + uploadError.message, 'error');
          setSaving(false);
          return;
        }

        if (data?.url) {
          imageUrl = data.url;
        }
      }

      const { error } = await insforge.database.from('products').insert([{
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image: imageUrl,
        is_on_deal: formData.is_on_deal,
        discount_percent: formData.is_on_deal ? parseInt(formData.discount_percent) : 0,
      }]);

      if (error) {
        console.error('Insert error:', error);
        showToast('Failed to create product: ' + error.message, 'error');
      } else {
        showToast('Product created successfully!', 'success');
        router.push('/admin');
      }
    } catch (err: any) {
      console.error('Error:', err);
      showToast('An error occurred: ' + err.message, 'error');
    }

    setSaving(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-gradient">Add Product</span>
        </h1>
        <p className="text-gray-400">Create a new product in your inventory</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all h-32 resize-none"
                placeholder="Enter product description"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Price *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-8 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="e.g., Action, RPG, Sports"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Product Image</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-500/50 transition-colors"
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="py-4">
                    <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500">Click to upload product image</p>
                    <p className="text-gray-600 text-sm mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center gap-4 p-4 bg-gray-800/30 border border-gray-700 rounded-xl">
                <input
                  type="checkbox"
                  id="isOnDeal"
                  checked={formData.is_on_deal}
                  onChange={(e) => setFormData({ ...formData, is_on_deal: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="isOnDeal" className="flex-1">
                  <span className="text-white font-medium">Put on Deal</span>
                  <p className="text-gray-500 text-sm">Enable discount for this product</p>
                </label>
              </div>
            </div>

            {formData.is_on_deal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:col-span-2"
              >
                <label className="block text-sm text-gray-400 mb-2">Discount Percentage</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-2xl font-bold text-gradient w-16 text-right">{formData.discount_percent}%</span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <motion.button
              type="button"
              onClick={() => router.push('/admin')}
              className="flex-1 px-6 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {saving ? 'Creating...' : 'Create Product'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
