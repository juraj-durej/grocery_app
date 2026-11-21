import { usersSchema } from '@/models/Schema';
import type { Database } from '@/utils/DBConnection';

/**
 * Inserts the Supabase user only when no row with the same id or email exists.
 * @param options - The database and the user returned by Supabase.
 * @returns A promise that resolves once the insert has run; existing rows are untouched.
 */
export const ensureUser = async (options: {
  db: Database;
  user: { id: string; email: string; phone: string | null };
}) => {
  await options.db.insert(usersSchema).values(options.user).onConflictDoNothing();
};

/**
 * Inserts the Supabase user or updates its email and phone when the id already exists.
 * @param options - The database and the user returned by Supabase.
 * @returns A promise that resolves once the row is saved.
 */
export const saveUser = async (options: {
  db: Database;
  user: { id: string; email: string; phone: string | null };
}) => {
  await options.db
    .insert(usersSchema)
    .values(options.user)
    .onConflictDoUpdate({
      target: usersSchema.id,
      set: { email: options.user.email, phone: options.user.phone, updatedAt: new Date() },
    });
};
