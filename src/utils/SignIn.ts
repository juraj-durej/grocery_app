import type { AuthSession, AuthUser } from '@/stores/AppStore';

type SignInResponse = {
  data: {
    user: {
      id: string;
      email?: string;
      phone?: string;
      user_metadata?: Record<string, unknown>;
    } | null;
    session: {
      access_token: string;
      refresh_token: string;
      expires_at?: number;
    } | null;
  };
  error: { code?: string } | null;
};

/** Minimal structural type of the Supabase auth client used for sign in. */
export type SignInAuthClient = {
  signInWithPassword: (credentials: { email: string; password: string }) => Promise<SignInResponse>;
};

type SignInResult =
  | { status: 'signed_in'; user: AuthUser; session: AuthSession }
  | { status: 'error'; error: 'invalid_credentials' | 'signin_failed' };

/**
 * Signs in with email and password through Supabase and maps the response to a result.
 * Unconfirmed emails and other failures map to `signin_failed`.
 * @param options - The auth client and the credentials.
 * @returns The signed-in user and session, or an error code.
 */
export async function signInWithEmail(options: {
  auth: SignInAuthClient;
  input: { email: string; password: string };
}): Promise<SignInResult> {
  const { data, error } = await options.auth.signInWithPassword({
    email: options.input.email,
    password: options.input.password,
  });

  if (error) {
    return {
      status: 'error',
      error: error.code === 'invalid_credentials' ? 'invalid_credentials' : 'signin_failed',
    };
  }

  if (!data.user || !data.session) {
    return { status: 'error', error: 'signin_failed' };
  }

  const { user_metadata: metadata = {}, phone: userPhone } = data.user;
  const { phone: metadataPhone } = metadata;
  const fallbackPhone = typeof metadataPhone === 'string' ? metadataPhone : '';
  let phone = fallbackPhone;

  if (userPhone) {
    phone = userPhone;
  }

  return {
    status: 'signed_in',
    user: { id: data.user.id, email: data.user.email ?? options.input.email, phone },
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at ?? null,
    },
  };
}
