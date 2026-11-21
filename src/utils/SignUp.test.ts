import { describe, expect, it } from 'vitest';
import type { SignUpAuthClient } from './SignUp';
import { createAccount } from './SignUp';

const input = {
  email: 'jane@example.com',
  phone: '+4712345678',
  password: 'Groceries123',
};

const fakeAuth = (response: Awaited<ReturnType<SignUpAuthClient['signUp']>>): SignUpAuthClient => ({
  signUp: async () => await Promise.resolve(response),
});

describe('create account', () => {
  it('returns the user and session when Supabase returns a session', async () => {
    const auth = fakeAuth({
      data: {
        user: { id: 'u1', email: 'jane@example.com', identities: [{}] },
        session: { access_token: 'a', refresh_token: 'r', expires_at: 123 },
      },
      error: null,
    });

    await expect(createAccount({ auth, input })).resolves.toStrictEqual({
      status: 'signed_in',
      user: { id: 'u1', email: 'jane@example.com', phone: '+4712345678' },
      session: { accessToken: 'a', refreshToken: 'r', expiresAt: 123 },
    });
  });

  it('falls back to the input email and null expiry', async () => {
    const auth = fakeAuth({
      data: {
        user: { id: 'u1' },
        session: { access_token: 'a', refresh_token: 'r' },
      },
      error: null,
    });

    await expect(createAccount({ auth, input })).resolves.toMatchObject({
      user: { email: 'jane@example.com' },
      session: { expiresAt: null },
    });
  });

  it('requires confirmation when there is no session', async () => {
    const auth = fakeAuth({
      data: { user: { id: 'u1', identities: [{}] }, session: null },
      error: null,
    });

    await expect(createAccount({ auth, input })).resolves.toStrictEqual({
      status: 'confirmation_required',
      user: { id: 'u1', email: 'jane@example.com', phone: '+4712345678' },
    });
  });

  it.each(['user_already_exists', 'email_exists'])(
    'reports a taken email for code %s',
    async (code) => {
      const auth = fakeAuth({
        data: { user: null, session: null },
        error: { code },
      });

      await expect(createAccount({ auth, input })).resolves.toStrictEqual({
        status: 'error',
        error: 'email_taken',
      });
    },
  );

  it('reports a taken email when identities are empty', async () => {
    const auth = fakeAuth({
      data: { user: { id: 'u1', identities: [] }, session: null },
      error: null,
    });

    await expect(createAccount({ auth, input })).resolves.toStrictEqual({
      status: 'error',
      error: 'email_taken',
    });
  });

  it('reports a generic failure for other errors', async () => {
    const auth = fakeAuth({
      data: { user: null, session: null },
      error: { code: 'weak_password' },
    });

    await expect(createAccount({ auth, input })).resolves.toStrictEqual({
      status: 'error',
      error: 'signup_failed',
    });
  });
});
