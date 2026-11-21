import { describe, expect, it } from 'vitest';
import { SignInValidation } from './SignInValidation';

const valid = { email: 'jane@example.com', password: 'x', rememberMe: false };

describe('sign in validation', () => {
  it('accepts valid input and trims the email', () => {
    const result = SignInValidation.safeParse({ ...valid, email: '  jane@example.com ' });

    expect(result.data).toStrictEqual(valid);
  });

  it('reports a required email when blank', () => {
    const result = SignInValidation.safeParse({ ...valid, email: '   ' });

    expect(result.error?.issues[0]?.message).toBe('error_email_required');
  });

  it('reports an invalid email', () => {
    const result = SignInValidation.safeParse({ ...valid, email: 'nope' });

    expect(result.error?.issues[0]?.message).toBe('error_email_invalid');
  });

  it('reports a required password when empty', () => {
    const result = SignInValidation.safeParse({ ...valid, password: '' });

    expect(result.error?.issues[0]?.message).toBe('error_password_required');
  });

  it('rejects a non-boolean remember me', () => {
    expect(SignInValidation.safeParse({ ...valid, rememberMe: 'yes' }).success).toBeFalsy();
  });
});
