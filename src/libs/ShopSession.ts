import { cookies } from 'next/headers';

export const SHOP_SESSION_COOKIE = 'shop_session';

/** Options of the anonymous shop session cookie. */
export const SHOP_SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
} as const;

/**
 * Reads the anonymous shop session id without creating one.
 * @returns The session id, or undefined when the browser has no session yet.
 */
export const getShopSessionId = async () => {
  const cookieStore = await cookies();
  return cookieStore.get(SHOP_SESSION_COOKIE)?.value;
};

/**
 * Returns the anonymous shop session id, creating the cookie when missing. Server actions only.
 * @returns The existing or newly created session id.
 */
export const ensureShopSessionId = async () => {
  const existing = await getShopSessionId();
  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(SHOP_SESSION_COOKIE, sessionId, SHOP_SESSION_COOKIE_OPTIONS);
  return sessionId;
};
