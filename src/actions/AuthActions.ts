'use server';

import { getLocale } from 'next-intl/server';
import { redirect } from '@/libs/I18nNavigation';
import { createSupabaseServerClient } from '@/libs/SupabaseServer';

/** Signs the current user out and redirects to the locale home page. */
export const signOut = async () => {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  redirect({ href: '/', locale: await getLocale() });
};
