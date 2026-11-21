import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { beforeEach, describe, expect, it } from 'vitest';
import * as schema from '@/models/Schema';
import { usersSchema } from '@/models/Schema';
import { seedDatabase } from '@/models/Seed';
import { saveUser } from '@/models/Users';

const id = '11111111-1111-4111-8111-111111111111';

const createDb = async () => {
  const db = drizzle({ client: new PGlite(), schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'migrations') });

  return db;
};

describe('users', () => {
  let db: Awaited<ReturnType<typeof createDb>>;

  beforeEach(async () => {
    db = await createDb();
  });

  describe(saveUser, () => {
    it('inserts a new user with the customer role and timestamps', async () => {
      await saveUser({ db, user: { id, email: 'a@b.no', phone: '+4712345678' } });

      const rows = await db.select().from(usersSchema);

      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        id,
        email: 'a@b.no',
        phone: '+4712345678',
        role: 'customer',
      });
      expect(rows[0]?.createdAt).toBeInstanceOf(Date);
      expect(rows[0]?.updatedAt).toBeInstanceOf(Date);
    });

    it('updates email and phone and bumps updatedAt for the same id', async () => {
      await saveUser({ db, user: { id, email: 'a@b.no', phone: '+4712345678' } });
      const [before] = await db.select().from(usersSchema);
      await sleep(10);
      await saveUser({ db, user: { id, email: 'c@d.no', phone: '+4787654321' } });

      const rows = await db.select().from(usersSchema);

      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ id, email: 'c@d.no', phone: '+4787654321' });
      expect(rows[0]?.createdAt).toStrictEqual(before?.createdAt);
      expect(rows[0]?.updatedAt.getTime()).toBeGreaterThan(before?.updatedAt.getTime() ?? 0);
    });
  });

  describe(seedDatabase, () => {
    it('seeds one customer and one admin idempotently', async () => {
      await seedDatabase(db);
      await seedDatabase(db);

      const rows = await db.select().from(usersSchema);

      expect(rows.map((row) => row.role).toSorted()).toStrictEqual(['admin', 'customer']);
    });
  });
});
