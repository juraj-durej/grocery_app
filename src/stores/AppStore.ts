import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/stores/Cart';
import { addCartItem, removeCartItem, updateCartItemQuantity } from '@/stores/Cart';

export type { Product } from '@/stores/Cart';
export type AuthUser = { id: string; email: string; phone: string };
export type AuthSession = { accessToken: string; refreshToken: string; expiresAt: number | null };

type AppState = {
  user: AuthUser | null;
  session: AuthSession | null;
  products: Product[];
  cartItems: CartItem[];
  setAuth: (auth: { user: AuthUser; session: AuthSession | null }) => void;
  clearAuth: () => void;
  setProducts: (products: Product[]) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
};

/**
 * Keeps the data that is persisted to localStorage; the session stays in memory only.
 * @param state - Full store state.
 * @returns The persisted slice.
 */
export const partializeAppState = (state: AppState) => ({
  user: state.user,
  products: state.products,
  cartItems: state.cartItems,
});

/**
 * Global client store for the user, auth session, products and shopping cart.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      products: [],
      cartItems: [],
      setAuth: (auth) => set({ user: auth.user, session: auth.session }),
      clearAuth: () => set({ user: null, session: null, cartItems: [] }),
      setProducts: (products) => set({ products }),
      addToCart: (product, quantity = 1) =>
        set((state) => ({ cartItems: addCartItem(state.cartItems, product, quantity) })),
      updateCartItemQuantity: (productId, quantity) =>
        set((state) => ({
          cartItems: updateCartItemQuantity(state.cartItems, productId, quantity),
        })),
      removeFromCart: (productId) =>
        set((state) => ({ cartItems: removeCartItem(state.cartItems, productId) })),
      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: 'grocery-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: partializeAppState,
    },
  ),
);
