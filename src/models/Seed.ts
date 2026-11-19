import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import type * as schema from '@/models/Schema';
import { counterSchema } from '@/models/Schema';

/**
 * Seeds the database with deterministic, hand-written demo data.
 *
 * Rule: every new table gets realistic seed data here in the same PR.
 * Seeding must stay idempotent (insert-if-empty or `onConflictDoNothing`) because it runs on every
 * in-memory deployment start (`DB_MODE=pglite`).
 * @param db The Drizzle database to seed.
 */
export const seedDatabase = async (db: PgDatabase<PgQueryResultHKT, typeof schema>) => {
  await db.insert(counterSchema).values({ id: 0, count: 7 }).onConflictDoNothing();
};
