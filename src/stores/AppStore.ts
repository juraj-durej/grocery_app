import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AuthUser = { id: string; email: string; phone: string };
export type AuthSession = { accessToken: string; refreshToken: string; expiresAt: number | null };

type AppState = {
  user: AuthUser | null;
  session: AuthSession | null;
  setAuth: (auth: { user: AuthUser; session: AuthSession | null }) => void;
  clearAuth: () => void;
};

/**
 * Keeps the data that is persisted to localStorage; the session stays in memory only.
 * @param state - Full store state.
 * @returns The persisted slice.
 */
export const partializeAppState = (state: AppState) => ({
  user: state.user,
});

/**
 * Global client store for the user and auth session returned by Supabase.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      setAuth: (auth) => set({ user: auth.user, session: auth.session }),
      clearAuth: () => set({ user: null, session: null }),
    }),
    {
      name: 'grocery-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: partializeAppState,
    },
  ),
);
