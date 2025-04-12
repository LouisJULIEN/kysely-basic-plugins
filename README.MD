# Kysely Plugins

This repo contains the source code of two Kysely plugins:

- [auto-updated-at](src/auto-updated-at): automatically updates a column (e.g. "updated_at) each time an update is made
  on a row
- [soft-delete](src/soft-delete): `.selectFrom(...)` and `updateTable(...)` can't be made on a row whose deletion column
(e.g. "deleted_at") is not `NULL`

## Questions about the usage

See [FAQ.MD](FAQ.MD)

## Installation

Copy the files whose names ends with ".plugin.ts" and paste it to you source code. Import it as for example:

```ts
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { DB } from "./db";
import { AutoUpdatedAt } from "./plugins/auto-updated-at.plugin";
import { SoftDelete } from "./plugins/soft-deletion.plugin";

const ignoredTables = [];

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: XXXXXX,
    }),
  }),
  plugins: [
    new CamelCasePlugin(),
    new SoftDelete({ ignoredTables }),
    new AutoUpdatedAt({ ignoredTables }),
  ],
  log: ["error"],
});

```

## Run the tests & build

### Set up

You need node, npm and Postgres installed

```bash
psql -c "CREATE DATABASE kysely_plugin"
npm i
npm run migrate:latest
```

### Run the tests

```bash
npm run test
```

### Build

```bash
npm run build
```

## Contributors

[victormachado-ada-tech](https://github.com/victormachado-ada-tech) who published a soft delete plugin
in [an issue](https://github.com/kysely-org/kysely/issues/803)


