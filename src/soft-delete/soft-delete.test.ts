import { truncateLocalDatabase } from "../utils/test/truncate-database.tester";
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "../utils/db/db";
import { Pool } from "pg";
import { databaseUrl } from "../utils/db/env";
import { SoftDelete } from "./soft-delete.plugin";

const ignoredTables: string[] = [];
export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: databaseUrl,
    }),
  }),
  plugins: [
    new SoftDelete({
      ignoredTables,
    }),
  ],
  log: ["error", "query"],
});


describe("Soft delete plugin", () => {
  beforeAll(async () => {
    await truncateLocalDatabase();
  });

  it("should soft delete", async () => {
    const noBot = await db.selectFrom("mom").where("id", "=", 12).executeTakeFirst();
    expect(noBot).toBeUndefined();

    await db
      .insertInto("mom")
      .values({ id: 12 })
      .execute();

    const oneBot = await db.selectFrom("mom").where("id", "=", 12).executeTakeFirst();
    expect(oneBot).toBeDefined();

    await db
      .updateTable("mom")
      .set({ deleted_at: new Date() })
      .where("id", "=", 12)
      .returning("id")
      .executeTakeFirstOrThrow();

    const noBotBecauseDeleted = await db
      .selectFrom("mom")
      .where("id", "=", 12)
      .executeTakeFirst();
    expect(noBotBecauseDeleted).toBeUndefined();
  });
});
