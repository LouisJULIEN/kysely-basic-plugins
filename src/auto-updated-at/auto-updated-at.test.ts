import { AutoUpdatedAtPlugin } from "./auto-updated-at.plugin";
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "../utils/db/db";
import { Pool } from "pg";
import { databaseUrl } from "../utils/db/env";
import { truncateLocalDatabase } from "../utils/test/truncate-database.tester";
import { sleep } from "../utils/test/misc";

const ignoredTables: string[] = [];
export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: databaseUrl,
    }),
  }),
  plugins: [
    new AutoUpdatedAtPlugin({
      ignoredTables,
    }),
  ],
  log: ["error", "query"],
});


describe("Auto updated at plugin", () => {
  beforeAll(async () => {
    await truncateLocalDatabase();
  });

  it("should auto update at", async () => {
    const { updated_at: firstUpdatedAt } = await db
      .insertInto("mom")
      .values({ id: 7 })
      .returning(["id", "updated_at"])
      .executeTakeFirstOrThrow();
    expect(firstUpdatedAt).toBeDefined();

    await sleep(1_000);

    const { updated_at: secondUpdatedAt } = await db
      .updateTable("mom")
      .set({})
      .returning(["updated_at"])
      .executeTakeFirstOrThrow();
    expect(secondUpdatedAt).toBeDefined();
    expect(secondUpdatedAt).greaterThan(firstUpdatedAt);

    await sleep(1_000);

    const { updated_at: thirdUpdatedAt } = await db
      .selectFrom("mom")
      .select(["updated_at"])
      .executeTakeFirstOrThrow();

    expect(thirdUpdatedAt).toEqual(secondUpdatedAt);
  });
});
