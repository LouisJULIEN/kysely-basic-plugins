# Kysely Plugins
<img src="assets/logo.png" height="240px" width="240px" /><br/>
This repo contains the source code of two basic [Kysely](https://kysely.dev/) plugins:

- [auto-updated-at](src/auto-updated-at/auto-updated-at.plugin.ts): automatically updates a column (e.g. "updated_at)
  each time an update is made on a row
- [soft-delete](src/soft-delete/soft-delete.plugin.ts): `.selectFrom(...)` and `updateTable(...)` ignore rows
  whose deletion column (e.g. "deleted_at") is not `NULL`

## Questions about the usage

See [FAQ.MD](FAQ.MD)

## Installation

Copy the files whose names ends with `.plugin.ts` and paste it into you source code. You can then import it as follows:

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
    new SoftDelete({ ignoredTables, updatedAtColumnName: "my_updated_at" }),
    new AutoUpdatedAt({ ignoredTables, deletedAtColumnName: "terminated_at" }),
  ],
});

```

## Run the tests & build

### Set up

You need Node.js, npm and Postgres installed

```bash
psql -c "CREATE DATABASE kysely_plugin;"
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

[victormachado-ada-tech](https://github.com/victormachado-ada-tech) who published a good first version of a soft delete
plugin in [an issue](https://github.com/kysely-org/kysely/issues/803)
