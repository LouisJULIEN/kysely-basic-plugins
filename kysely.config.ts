import { defineConfig } from "kysely-ctl";

import { db } from "./src/utils/db";

export default defineConfig({
  kysely: db,
  migrations: {
    migrationFolder: "src/utils/db/migrations",
  },
});
