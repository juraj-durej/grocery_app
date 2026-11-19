import { createDbConnection } from '@/utils/DBConnection';
import { Env } from './Env';

declare global {
  var cachedDrizzle: ReturnType<typeof createDbConnection> | undefined;
}

// Stores the db connection in the global scope to prevent multiple instances due to hot reloading with Next.js
// and to share one in-memory PGlite (migrated and seeded once) across bundles of the same instance
const connection = globalThis.cachedDrizzle ?? createDbConnection();

if (Env.DB_MODE === 'pglite' || Env.NODE_ENV !== 'production') {
  globalThis.cachedDrizzle = connection;
}

const { db } = connection;

/**
 * Resolves once the database is migrated and seeded (immediately outside `DB_MODE=pglite`).
 * @returns A promise to await before the first query.
 */
export const ensureDbReady = async () => {
  await connection.ready;
};

export { db };
