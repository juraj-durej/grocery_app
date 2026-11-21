'use server';

import { getLocale } from 'next-intl/server';
import * as z from 'zod';
import { db, ensureDbReady } from '@/libs/DB';
import { redirect } from '@/libs/I18nNavigation';
import { logger } from '@/libs/Logger';
import { createSupabaseServerClient } from '@/libs/SupabaseServer';
import { saveUser } from '@/models/Users';
import { createAccount } from '@/utils/SignUp';
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

/** Signs the current user out and redirects to the locale home page. */
export const signOut = async () => {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  redirect({ href: '/', locale: await getLocale() });
};
