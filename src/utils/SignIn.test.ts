import { describe, expect, it } from 'vitest';
import type { SignInAuthClient } from './SignIn';
import { signInWithEmail } from './SignIn';

const input = { email: 'jane@example.com', password: 'Groceries123' };
const session = { access_token: 'a', refresh_token: 'r', expires_at: 123 };

const fakeAuth = (
  response: Awaited<ReturnType<SignInAuthClient['signInWithPassword']>>,
): SignInAuthClient => ({
  signInWithPassword: async () => await Promise.resolve(response),
});

describe('sign in with email', () => {
  it('returns the user and session on success', async () => {
    const auth = fakeAuth({
      data: { user: { id: 'u1', email: 'jane@example.com', phone: '+4712345678' }, session },
      error: null,
    });

    await expect(signInWithEmail({ auth, input })).resolves.toStrictEqual({
      status: 'signed_in',
      user: { id: 'u1', email: 'jane@example.com', phone: '+4712345678' },
      session: { accessToken: 'a', refreshToken: 'r', expiresAt: 123 },
    });
  });

  it('falls back to the metadata phone when the user phone is empty', async () => {
    const auth = fakeAuth({
      data: { user: { id: 'u1', phone: '', user_metadata: { phone: '+4799999999' } }, session },
      error: null,
    });

    await expect(signInWithEmail({ auth, input })).resolves.toMatchObject({
      user: { phone: '+4799999999' },
    });
  });

  it('falls back to the input email, empty phone and null expiry', async () => {
    const auth = fakeAuth({
      data: {
        user: { id: 'u1', user_metadata: { phone: 5 } },
        session: { access_token: 'a', refresh_token: 'r' },
      },
      error: null,
    });

    await expect(signInWithEmail({ auth, input })).resolves.toMatchObject({
      user: { email: 'jane@example.com', phone: '' },
      session: { expiresAt: null },
    });
  });

  it('reports invalid credentials', async () => {
    const auth = fakeAuth({
      data: { user: null, session: null },
      error: { code: 'invalid_credentials' },
    });

    await expect(signInWithEmail({ auth, input })).resolves.toStrictEqual({
      status: 'error',
      error: 'invalid_credentials',
    });
  });

  it('reports a generic failure for an unconfirmed email', async () => {
    const auth = fakeAuth({
      data: { user: null, session: null },
      error: { code: 'email_not_confirmed' },
    });

    await expect(signInWithEmail({ auth, input })).resolves.toStrictEqual({
      status: 'error',
      error: 'signin_failed',
    });
  });

  it('reports a generic failure for an error without a code', async () => {
    const auth = fakeAuth({ data: { user: null, session: null }, error: {} });

    await expect(signInWithEmail({ auth, input })).resolves.toStrictEqual({
      status: 'error',
      error: 'signin_failed',
    });
  });

  it('reports a generic failure when the session is missing', async () => {
    const auth = fakeAuth({ data: { user: { id: 'u1' }, session: null }, error: null });

    await expect(signInWithEmail({ auth, input })).resolves.toStrictEqual({
      status: 'error',
      error: 'signin_failed',
    });
  });
});
