'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Product, User } from '@/types';
import { insforge } from '@/lib/insforge';
import { useToast } from '@/hooks/useToast';
import DeleteConfirmModal from './components/DeleteConfirmModal';

const ADMIN_EMAILS = ['admin-space@gmail.com', 'iyedchebbi18@gmail.com', 'adminadmin@gmail.com', 'miladicode1379@gmail.com'];

export default function AdminProducts() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
      fetchProducts();
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

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await insforge.database
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setProducts(data.map((p: any) => ({
        ...p,
        image: p.image || null,
      })));
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    
    setSaving(true);
    
    const { error } = await insforge.database
      .from('products')
      .delete()
      .eq('id', deleteModal.product.id);

    if (error) {
      showToast('Failed to delete product: ' + error.message, 'error');
    } else {
      showToast('Product deleted successfully', 'success');
      fetchProducts();
    }
    setSaving(false);
    setDeleteModal({ open: false, product: null });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;

    setSaving(true);
    
    const { error } = await insforge.database
      .from('products')
      .update({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        category: editingProduct.category,
        is_on_deal: editingProduct.is_on_deal,
        discount_percent: editingProduct.discount_percent,
      })
      .eq('id', editingProduct.id);

    if (error) {
      showToast('Failed to update product: ' + error.message, 'error');
    } else {
      showToast('Product updated successfully', 'success');
      setEditingProduct(null);
      fetchProducts();
    }
    setSaving(false);
  };

  if (authLoading || loading) {
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
          <span className="text-gradient">All Products</span>
        </h1>
        <p className="text-gray-400">Manage your product inventory</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-gray-400 font-medium">Product</th>
                <th className="text-left p-4 text-gray-400 font-medium">Category</th>
                <th className="text-left p-4 text-gray-400 font-medium">Price</th>
                <th className="text-left p-4 text-gray-400 font-medium">Deal</th>
                <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-800/50 hover:bg-white/5"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-cyan-400">${product.price.toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    {product.is_on_deal ? (
                      <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full text-sm font-medium text-black">
                        -{product.discount_percent}%
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <motion.button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </motion.button>
                      <motion.button
                        onClick={() => setDeleteModal({ open: true, product })}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No products found. Add your first product!
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {deleteModal.open && (
          <DeleteConfirmModal
            productName={deleteModal.product?.name || ''}
            onConfirm={handleDelete}
            onCancel={() => setDeleteModal({ open: false, product: null })}
            loading={saving}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setEditingProduct(null)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg p-6 rounded-2xl bg-gray-900 border border-cyan-500/30"
            >
              <h2 className="text-2xl font-bold mb-6">
                <span className="text-gradient">Edit Product</span>
              </h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 h-24"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Category</label>
                    <input
                      type="text"
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isOnDeal"
                      checked={editingProduct.is_on_deal}
                      onChange={(e) => setEditingProduct({ ...editingProduct, is_on_deal: e.target.checked })}
                      className="w-4 h-4 rounded bg-gray-800 border-gray-700"
                    />
                    <label htmlFor="isOnDeal" className="text-sm text-gray-300">On Deal</label>
                  </div>
                  {editingProduct.is_on_deal && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Discount %</label>
                      <input
                        type="number"
                        value={editingProduct.discount_percent}
                        onChange={(e) => setEditingProduct({ ...editingProduct, discount_percent: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500"
                        min="0"
                        max="100"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
