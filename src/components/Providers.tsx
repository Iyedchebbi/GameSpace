'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { ToastProvider } from '@/hooks/useToast';
import { AuthModalProvider } from '@/hooks/useAuthModal';
import { CartModalProvider } from '@/hooks/useCartModal';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthModalProvider>
        <AuthProvider>
          <CartModalProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </CartModalProvider>
        </AuthProvider>
      </AuthModalProvider>
    </ToastProvider>
  );
}
