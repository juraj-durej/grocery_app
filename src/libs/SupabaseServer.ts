import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Env } from '@/libs/Env';
import { applyRememberMe, isRememberMe, REMEMBER_ME_COOKIE } from '@/utils/AuthCookies';

/**
 * Creates a Supabase client for Server Components, Server Actions and Route Handlers.
 * @param options - Set `remember` to override the remember-me cookie; off makes auth cookies session cookies.
 * @returns A Supabase client bound to the request cookies.
 */
export const createSupabaseServerClient = async (options?: { remember?: boolean }) => {
  const cookieStore = await cookies();
  const remember = options?.remember ?? isRememberMe(cookieStore.get(REMEMBER_ME_COOKIE)?.value);

  return createServerClient(
    Env.NEXT_PUBLIC_SUPABASE_URL,
    Env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            for (const { name, value, options: cookieOptions } of cookiesToSet) {
              cookieStore.set(
                name,
                value,
                applyRememberMe({ remember, value, options: cookieOptions }),
              );
            }
          } catch {
            // Called from a Server Component where cookies are read-only; the proxy refreshes sessions.
          }
        },
      },
    },
  );
};
