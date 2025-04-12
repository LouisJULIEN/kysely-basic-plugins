import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { DB } from "./db";
import { databaseUrl } from "./env";


export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: databaseUrl,
    }),
  }),
  log: ["error", "query"]
});
