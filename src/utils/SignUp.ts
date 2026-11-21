import type { AuthSession, AuthUser } from '@/stores/AppStore';
import type { SignUpInput } from '@/validations/SignUpValidation';

type SignUpResponse = {
  data: {
    user: { id: string; email?: string; identities?: unknown[] } | null;
    session: {
      access_token: string;
      refresh_token: string;
      expires_at?: number;
    } | null;
  };
  error: { code?: string } | null;
};

/** Minimal structural type of the Supabase auth client used for sign up. */
export type SignUpAuthClient = {
  signUp: (credentials: {
    email: string;
    password: string;
    options: { data: { phone: string } };
  }) => Promise<SignUpResponse>;
};

export type CreateAccountResult =
  | { status: 'signed_in'; user: AuthUser; session: AuthSession }
  | { status: 'confirmation_required'; user: AuthUser }
  | { status: 'error'; error: 'email_taken' | 'signup_failed' };

/**
 * Creates a Supabase account and maps the response to a result.
 * @param options - The auth client and the validated sign up input.
 * @returns The signed-in user and session, a confirmation-required marker, or an error code.
 */
export async function createAccount(options: {
  auth: SignUpAuthClient;
  input: SignUpInput;
}): Promise<CreateAccountResult> {
  const { data, error } = await options.auth.signUp({
    email: options.input.email,
    password: options.input.password,
    options: { data: { phone: options.input.phone } },
  });

  if (error) {
    const taken = error.code === 'user_already_exists' || error.code === 'email_exists';

    return { status: 'error', error: taken ? 'email_taken' : 'signup_failed' };
  }

  if (!data.user) {
    return { status: 'error', error: 'signup_failed' };
  }

  if (data.session) {
    return {
      status: 'signed_in',
      user: {
        id: data.user.id,
        email: data.user.email ?? options.input.email,
        phone: options.input.phone,
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at ?? null,
      },
    };
  }

  if (data.user.identities?.length === 0) {
    return { status: 'error', error: 'email_taken' };
  }

  return {
    status: 'confirmation_required',
    user: {
      id: data.user.id,
      email: data.user.email ?? options.input.email,
      phone: options.input.phone,
    },
  };
}
