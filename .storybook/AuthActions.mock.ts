export const signUp = async (_input: unknown) => {
  await Promise.resolve();

  return { status: 'invalid' as const, fieldErrors: {} };
};

export const signOut = async () => {
  await Promise.resolve();
};

export const signIn = async (_input: unknown) => {
  await Promise.resolve();

  return { status: 'invalid' as const, fieldErrors: {} };
};
