import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthSession, AuthUser, Product } from '@/stores/AppStore';
import { partializeAppState, useAppStore } from '@/stores/AppStore';

const user: AuthUser = { id: 'u1', email: 'a@b.no', phone: '+4712345678' };
const session: AuthSession = { accessToken: 'at', refreshToken: 'rt', expiresAt: 123 };
const milk: Product = { id: 'p1', name: 'Milk', price: 20, imageUrl: null };
const bread: Product = { id: 'p2', name: 'Bread', price: 30, imageUrl: null };

describe('AppStore', () => {
  beforeEach(() => {
    useAppStore.setState({ user: null, session: null, products: [], cartItems: [] });
  });

  describe('auth', () => {
    it('stores user and session on setAuth', () => {
      useAppStore.getState().setAuth({ user, session });

      expect(useAppStore.getState().user).toStrictEqual(user);
      expect(useAppStore.getState().session).toStrictEqual(session);
    });

    it('accepts a null session on setAuth', () => {
      useAppStore.getState().setAuth({ user, session: null });

      expect(useAppStore.getState().session).toBeNull();
    });

    it('clears user, session and cart on clearAuth', () => {
      useAppStore.getState().setAuth({ user, session });
      useAppStore.getState().addToCart(milk);
      useAppStore.getState().clearAuth();

      expect(useAppStore.getState().user).toBeNull();
      expect(useAppStore.getState().session).toBeNull();
      expect(useAppStore.getState().cartItems).toStrictEqual([]);
    });
  });

  describe('products', () => {
    it('replaces products on setProducts', () => {
      useAppStore.getState().setProducts([milk, bread]);

      expect(useAppStore.getState().products).toStrictEqual([milk, bread]);
    });
  });

  describe('cart', () => {
    it('adds a new product with quantity 1 by default', () => {
      useAppStore.getState().addToCart(milk);

      expect(useAppStore.getState().cartItems).toStrictEqual([{ product: milk, quantity: 1 }]);
    });

    it('merges quantity when the product is already in the cart', () => {
      useAppStore.getState().addToCart(milk, 2);
      useAppStore.getState().addToCart(milk, 3);

      expect(useAppStore.getState().cartItems).toStrictEqual([{ product: milk, quantity: 5 }]);
    });

    it('updates the quantity of an item', () => {
      useAppStore.getState().addToCart(milk);
      useAppStore.getState().updateCartItemQuantity('p1', 4);

      expect(useAppStore.getState().cartItems[0]?.quantity).toBe(4);
    });

    it('removes an item when the quantity is zero or less', () => {
      useAppStore.getState().addToCart(milk);
      useAppStore.getState().addToCart(bread);
      useAppStore.getState().updateCartItemQuantity('p1', 0);
      useAppStore.getState().updateCartItemQuantity('p2', -1);

      expect(useAppStore.getState().cartItems).toStrictEqual([]);
    });

    it('removes an item on removeFromCart', () => {
      useAppStore.getState().addToCart(milk);
      useAppStore.getState().addToCart(bread);
      useAppStore.getState().removeFromCart('p1');

      expect(useAppStore.getState().cartItems).toStrictEqual([{ product: bread, quantity: 1 }]);
    });

    it('empties the cart on clearCart', () => {
      useAppStore.getState().addToCart(milk);
      useAppStore.getState().clearCart();

      expect(useAppStore.getState().cartItems).toStrictEqual([]);
    });
  });

  describe('persistence', () => {
    it('excludes the session from the persisted state', () => {
      useAppStore.getState().setAuth({ user, session });
      useAppStore.getState().setProducts([milk]);
      useAppStore.getState().addToCart(milk);

      const persisted = partializeAppState(useAppStore.getState());

      expect(Object.keys(persisted).toSorted()).toStrictEqual(['cartItems', 'products', 'user']);
      expect(persisted).not.toHaveProperty('session');
    });
  });
});
