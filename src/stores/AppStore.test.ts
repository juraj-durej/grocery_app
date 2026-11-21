import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthSession, AuthUser } from '@/stores/AppStore';
import { partializeAppState, useAppStore } from '@/stores/AppStore';

const user: AuthUser = { id: 'u1', email: 'a@b.no', phone: '+4712345678' };
const session: AuthSession = { accessToken: 'at', refreshToken: 'rt', expiresAt: 123 };

describe('AppStore', () => {
  beforeEach(() => {
    useAppStore.setState({ user: null, session: null });
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

    it('clears user and session on clearAuth', () => {
      useAppStore.getState().setAuth({ user, session });
      useAppStore.getState().clearAuth();

      expect(useAppStore.getState().user).toBeNull();
      expect(useAppStore.getState().session).toBeNull();
    });
  });

  describe('persistence', () => {
    it('persists only the user', () => {
      useAppStore.getState().setAuth({ user, session });

      const persisted = partializeAppState(useAppStore.getState());

      expect(persisted).toStrictEqual({ user });
      expect(persisted).not.toHaveProperty('session');
    });
  });
});
