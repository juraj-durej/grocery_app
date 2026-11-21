export const REMEMBER_ME_COOKIE = 'remember_me';

/**
 * Decides whether auth cookies persist from the remember-me cookie value.
 * @param value - The raw cookie value, if any.
 * @returns False only for '0'; sessions without the cookie keep persisting.
 */
export const isRememberMe = (value: string | undefined) => value !== '0';

/**
 * Turns persistent auth cookie options into session cookie options when remember is off.
 * @param options - The remember flag, the cookie value and the cookie options set by Supabase.
 * @returns The options without `maxAge` and `expires` when remember is false, otherwise unchanged; removal cookies are never changed.
 */
export const applyRememberMe = <
  T extends { maxAge?: number; expires?: Date | number | string },
>(options: {
  remember: boolean;
  value: string;
  options: T;
}) => {
  const removing = options.value === '' || (options.options.maxAge ?? 1) <= 0;

  if (options.remember || removing) {
    return options.options;
  }

  const { maxAge: _maxAge, expires: _expires, ...rest } = options.options;

  return rest;
};
