import { detectBot } from '@arcjet/next';
import { createServerClient } from '@supabase/ssr';
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import arcjet from '@/libs/Arcjet';
import { Env } from '@/libs/Env';
import { SHOP_SESSION_COOKIE, SHOP_SESSION_COOKIE_OPTIONS } from '@/libs/ShopSession';
import { routing } from './libs/I18nRouting';

const handleI18nRouting = createMiddleware(routing);

const isProtectedRoute = (request: NextRequest) =>
  /^(\/[^/]+)?\/dashboard(\/.*)?$/u.test(request.nextUrl.pathname);

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    // Block all bots except the following
    allow: [
      // See https://docs.arcjet.com/bot-protection/identifying-bots
      'CATEGORY:SEARCH_ENGINE', // Allow search engines
      'CATEGORY:PREVIEW', // Allow preview links to show OG images
      'CATEGORY:MONITOR', // Allow uptime monitoring services
    ],
  }),
);

/**
 * Runs Arcjet, i18n routing and, for protected routes only, Supabase session refresh and auth check.
 * @param request - The incoming request.
 * @returns The i18n response, a redirect to sign-in, or a 403 for denied bots.
 */
export default async function proxy(request: NextRequest) {
  // Verify the request with Arcjet
  // Use `process.env` instead of Env to reduce bundle size in middleware
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Issue the anonymous shop session up front so concurrent server actions share it.
  // Set on the request before i18n routing so the same request's render sees it.
  const newSessionId = request.cookies.has(SHOP_SESSION_COOKIE) ? undefined : crypto.randomUUID();
  if (newSessionId) {
    request.cookies.set(SHOP_SESSION_COOKIE, newSessionId);
  }

  const response = handleI18nRouting(request);
  if (newSessionId) {
    response.cookies.set(SHOP_SESSION_COOKIE, newSessionId, SHOP_SESSION_COOKIE_OPTIONS);
  }

  if (!isProtectedRoute(request)) {
    return response;
  }

  const supabase = createServerClient(
    Env.NEXT_PUBLIC_SUPABASE_URL,
    Env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const locale = request.nextUrl.pathname.match(/(\/.*)\/dashboard/u)?.at(1) ?? '';

    const redirect = NextResponse.redirect(new URL(`${locale}/sign-in`, request.url));
    if (newSessionId) {
      redirect.cookies.set(SHOP_SESSION_COOKIE, newSessionId, SHOP_SESSION_COOKIE_OPTIONS);
    }

    return redirect;
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next`, `/_vercel` or `monitoring`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!_next|_vercel|monitoring|api|.*\\..*).*)',
};
