import * as z from 'zod';

export const SignInValidation = z.object({
  email: z.string().trim().min(1, 'error_email_required').pipe(z.email('error_email_invalid')),
  password: z.string().min(1, 'error_password_required'),
  rememberMe: z.boolean(),
});

export type SignInInput = z.infer<typeof SignInValidation>;
