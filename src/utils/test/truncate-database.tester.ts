import { sql } from "kysely";
import { db } from "../db";


export async function truncateLocalDatabase() {

  console.warn("Truncating database");

  await db.transaction().execute(async (trx) => {
    const tables = await sql<{ table_name: string }>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND NOT starts_with(table_name, 'kysely_')
    `.execute(trx);

    for (const table of tables.rows) {
      console.log(table)
      await sql`TRUNCATE TABLE "${sql.raw(table.table_name)}" CASCADE;`.execute(trx);
    }

  })
}
