'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { insforge } from '@/lib/insforge';
import { CartItemWithProduct } from '@/types';
import { useAuth } from './useAuth';

interface CartContextType {
  items: CartItemWithProduct[];
  loading: boolean;
  addToCart: (productId: string) => Promise<{ error: string | null }>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    const { data } = await insforge.database
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', user.id);

    if (data) {
      setItems(data.map((item: any) => ({
        ...item,
        products: {
          ...item.products,
          image: item.products.image || null,
        },
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId: string) => {
    if (!user) return { error: 'Please sign in to add items to cart' };

    const existing = items.find(item => item.product_id === productId);
    if (existing) {
      await insforge.database.from('cart_items').update({
        quantity: existing.quantity + 1,
      }).eq('id', existing.id);
    } else {
      await insforge.database.from('cart_items').insert([{
        user_id: user.id,
        product_id: productId,
        quantity: 1,
      }]);
    }

    await fetchCart();
    return { error: null };
  };

  const removeFromCart = async (itemId: string) => {
    await insforge.database.from('cart_items').delete().eq('id', itemId);
    await fetchCart();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    await insforge.database.from('cart_items').update({ quantity }).eq('id', itemId);
    await fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await insforge.database.from('cart_items').delete().eq('user_id', user.id);
    setItems([]);
  };

  const total = items.reduce((sum, item) => {
    const price = item.products?.price || 0;
    const discount = item.products?.discount_percent || 0;
    const discountedPrice = price * (1 - discount / 100);
    return sum + discountedPrice * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
