import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import type * as schema from '@/models/Schema';

/**
 * Seeds the database with deterministic, hand-written demo data.
 *
 * Rule: every new table gets realistic seed data here in the same PR.
 * Seeding must stay idempotent (insert-if-empty or `onConflictDoNothing`) because it runs on every
 * in-memory deployment start (`DB_MODE=pglite`).
 * @param _db The Drizzle database to seed (unused until tables exist).
 * @returns A promise that resolves once seeding is done.
 */
export const seedDatabase = async (_db: PgDatabase<PgQueryResultHKT, typeof schema>) => {
  // No tables yet, nothing to seed.
  await Promise.resolve();
};
