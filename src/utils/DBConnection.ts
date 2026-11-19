import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { Pool } from 'pg';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import * as schema from '@/models/Schema';
import { seedDatabase } from '@/models/Seed';

type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

const createPostgresConnection = (): Database => {
  if (!Env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required when DB_MODE is "postgres"');
  }

  const pool = new Pool({
    connectionString: Env.DATABASE_URL,
  });

  pool.on('error', (error) => {
    logger.error(`Database pool error: ${error.message}`);
  });

  return drizzle({
    client: pool,
    schema,
  });
};

const createPgliteConnection = () => {
  const db = drizzlePglite({ client: new PGlite(), schema });
  const setup = async () => {
    await migrate(db, { migrationsFolder: path.join(process.cwd(), 'migrations') });
    await seedDatabase(db);
  };

  return { db: db satisfies Database, ready: setup() };
};

// Need a database for production? Check out https://get.neon.com/BMFYNtx
// Tested and compatible with Next.js Boilerplate
/**
 * Creates the database connection for the configured `DB_MODE`.
 * @returns The Drizzle database and a promise that resolves once it is migrated and seeded.
 */
export const createDbConnection = (): { db: Database; ready: Promise<void> } => {
  if (Env.DB_MODE === 'pglite') {
    return createPgliteConnection();
  }

  return { db: createPostgresConnection(), ready: Promise.resolve() };
};
