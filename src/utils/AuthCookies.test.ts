import { describe, expect, it } from 'vitest';
import { applyRememberMe, isRememberMe } from './AuthCookies';

const persistent = { path: '/', maxAge: 400, expires: new Date(0), sameSite: 'lax' as const };

describe('apply remember me', () => {
  it('keeps the options when remember is on', () => {
    expect(applyRememberMe({ remember: true, value: 'v', options: persistent })).toStrictEqual(
      persistent,
    );
  });

  it('removes max age and expires when remember is off', () => {
    expect(applyRememberMe({ remember: false, value: 'v', options: persistent })).toStrictEqual({
      path: '/',
      sameSite: 'lax',
    });
  });

  it('keeps the options of removal cookies with an empty value', () => {
    const removal = { path: '/', maxAge: 0 };

    expect(applyRememberMe({ remember: false, value: '', options: removal })).toStrictEqual(
      removal,
    );
  });

  it('keeps the options of removal cookies with a non-positive max age', () => {
    const removal = { path: '/', maxAge: 0, expires: new Date(0) };

    expect(applyRememberMe({ remember: false, value: 'x', options: removal })).toStrictEqual(
      removal,
    );
  });
});

describe('is remember me', () => {
  it.each([
    ['0', false],
    ['1', true],
    [undefined, true],
  ])('maps %s to %s', (value, expected) => {
    expect(isRememberMe(value)).toBe(expected);
  });
});
