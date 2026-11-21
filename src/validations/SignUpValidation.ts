import * as z from 'zod';

export const SignUpValidation = z.object({
  email: z.email('error_email_invalid'),
  phone: z.string().regex(/^\+?\d{7,15}$/u, 'error_phone_invalid'),
  password: z.string().min(8, 'error_password_too_short').max(72, 'error_password_too_long'),
});

export type SignUpInput = z.infer<typeof SignUpValidation>;
