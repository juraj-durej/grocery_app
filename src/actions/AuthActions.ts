'use server';

import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import * as z from 'zod';
import { db, ensureDbReady } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { redirect } from '@/libs/I18nNavigation';
import { logger } from '@/libs/Logger';
import { createSupabaseServerClient } from '@/libs/SupabaseServer';
import { ensureUser, saveUser } from '@/models/Users';
import { REMEMBER_ME_COOKIE } from '@/utils/AuthCookies';
import { signInWithEmail } from '@/utils/SignIn';
import { createAccount } from '@/utils/SignUp';
import { SignInValidation } from '@/validations/SignInValidation';
import { SignUpValidation } from '@/validations/SignUpValidation';

/**
 * Validates the sign up input and creates the account through Supabase Auth.
 * @param input - Untrusted form values.
 * @returns The validation errors or the account creation result.
 */
export const signUp = async (input: unknown) => {
  const parsed = SignUpValidation.safeParse(input);

  if (!parsed.success) {
    return {
      status: 'invalid' as const,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const result = await createAccount({
    auth: supabase.auth,
    input: parsed.data,
  });

  if (result.status === 'signed_in' || result.status === 'confirmation_required') {
    try {
      await ensureDbReady();
      await saveUser({ db, user: result.user });
    } catch (error) {
      logger.error('Saving user failed', { userId: result.user.id });
      throw error;
    }
  }

  if (result.status === 'signed_in') {
    logger.info('Account created', { userId: result.user.id });
  }

  return result;
};

const REMEMBER_ME_MAX_AGE = 60 * 60 * 24 * 400;

/**
 * Validates the sign in input, signs in through Supabase Auth and makes sure the user row exists.
 * @param input - Untrusted form values.
 * @returns The validation errors or the sign in result.
 */
export const signIn = async (input: unknown) => {
  const parsed = SignInValidation.safeParse(input);

  if (!parsed.success) {
    return {
      status: 'invalid' as const,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { rememberMe, ...credentials } = parsed.data;
  const supabase = await createSupabaseServerClient({ remember: rememberMe });
  const result = await signInWithEmail({ auth: supabase.auth, input: credentials });

  if (result.status === 'signed_in') {
    const cookieStore = await cookies();
    cookieStore.set(REMEMBER_ME_COOKIE, rememberMe ? '1' : '0', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: Env.NODE_ENV === 'production',
      ...(rememberMe ? { maxAge: REMEMBER_ME_MAX_AGE } : {}),
    });

    await ensureDbReady();
    await ensureUser({ db, user: { ...result.user, phone: result.user.phone || null } });

    logger.info('User signed in', { userId: result.user.id });
  }

  return result;
};

/** Signs the current user out and redirects to the locale home page. */
export const signOut = async () => {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.delete(REMEMBER_ME_COOKIE);

  redirect({ href: '/', locale: await getLocale() });
};
