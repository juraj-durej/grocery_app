import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Env } from '@/libs/Env';

/**
 * Creates a Supabase client for Server Components, Server Actions and Route Handlers.
 * @returns A Supabase client bound to the request cookies.
 */
export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    Env.NEXT_PUBLIC_SUPABASE_URL,
    Env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component where cookies are read-only; the proxy refreshes sessions.
          }
        },
      },
    },
  );
};
