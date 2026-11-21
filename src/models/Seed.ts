import { usersSchema } from '@/models/Schema';
import type { Database } from '@/utils/DBConnection';

const seedUsers = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'customer@grocery-app.test',
    phone: '+4790000001',
    role: 'customer',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    email: 'admin@grocery-app.test',
    phone: '+4790000002',
    role: 'admin',
  },
] satisfies (typeof usersSchema.$inferInsert)[];

/**
 * Seeds the database with deterministic, hand-written seed data.
 *
 * Rule: every new table gets realistic seed data here in the same PR.
 * Seeding must stay idempotent (insert-if-empty or `onConflictDoNothing`) because it runs on every
 * in-memory deployment start (`DB_MODE=pglite`).
 * @param db The Drizzle database to seed.
 * @returns A promise that resolves once seeding is done.
 */
export const seedDatabase = async (db: Database) => {
  await db.insert(usersSchema).values(seedUsers).onConflictDoNothing();
};
