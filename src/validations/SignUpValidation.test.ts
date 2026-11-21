import { describe, expect, it } from 'vitest';
import { SignUpValidation } from './SignUpValidation';

const valid = {
  email: 'jane@example.com',
  phone: '+4712345678',
  password: 'Groceries123',
};
const passes = (input: object) => SignUpValidation.safeParse({ ...valid, ...input }).success;

describe('sign up validation', () => {
  it('accepts valid input', () => {
    expect(passes({})).toBeTruthy();
  });

  it('accepts a phone number without a plus sign', () => {
    expect(passes({ phone: '12345678' })).toBeTruthy();
  });

  it('rejects an invalid email', () => {
    const result = SignUpValidation.safeParse({ ...valid, email: 'jane' });

    expect(result.error?.issues[0]?.message).toBe('error_email_invalid');
  });

  it('rejects phone numbers with spaces, letters or wrong length', () => {
    for (const phone of ['', '123456', '1234567890123456', '+47 123 456 78', 'abcdefgh']) {
      expect(passes({ phone })).toBeFalsy();
    }
  });

  it('enforces the password length boundaries', () => {
    expect(passes({ password: 'a'.repeat(7) })).toBeFalsy();
    expect(passes({ password: 'a'.repeat(8) })).toBeTruthy();
    expect(passes({ password: 'a'.repeat(72) })).toBeTruthy();

    const long = SignUpValidation.safeParse({
      ...valid,
      password: 'a'.repeat(73),
    });

    expect(long.error?.issues[0]?.message).toBe('error_password_too_long');
  });

  it('rejects empty input', () => {
    expect(passes({ email: '', phone: '', password: '' })).toBeFalsy();
  });
});
