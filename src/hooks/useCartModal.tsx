'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CartModalContextType {
  isOpen: boolean;
  openCartModal: () => void;
  closeCartModal: () => void;
}

const CartModalContext = createContext<CartModalContextType | undefined>(undefined);

export function CartModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openCartModal = () => setIsOpen(true);
  const closeCartModal = () => setIsOpen(false);

  return (
    <CartModalContext.Provider value={{ isOpen, openCartModal, closeCartModal }}>
      {children}
    </CartModalContext.Provider>
  );
}

export function useCartModal() {
  const context = useContext(CartModalContext);
  if (context === undefined) {
    throw new Error('useCartModal must be used within a CartModalProvider');
  }
  return context;
}
