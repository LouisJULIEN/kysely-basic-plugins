# Frequently Asked Questions

## Auto Updated At

### Can I customize the column referenced?

Yes. Use the `updatedAtColumnName` argument when instantiating the plugin.

## Soft delete

### Can I customize the column referenced?

Yes. Use the `deletedAtColumnName` argument when instantiating the plugin.

### Does Kysely `.deleteFrom(...)` now does a soft delete?

NO!! To soft delete, update the referenced column (e.g. "deleted_at") with an `.updateTable(...)`.
`.deleteFrom(...)` still does a hard delete.
It's up to you to decide to forbid `.deleteFrom(...)` with your linter or not.
Here's a basic example of how to do it in your `tsconfig.json` (you probably need to change the `object.name` value)

```json
{
  // ...
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "MemberExpression[object.name=db][property.name='deleteFrom']",
        "message": "Hard delete are not allowed"
      }
    ]
  }
}
```

## All plugins

### Do those plugins work on Postgres?

Yes. No other database have been tested yet.

### Do those plugins work independently?

Yes

### Do those plugins work together?

Yes

### Do those plugins work in combination with CamelCasePlugin?

Yes

### Is there any check that the column referenced (e.g. "updated_at" or "deleted_at") exists?

No, it's up to you to check it.

### Can I ignore some tables?

Yes. Use the `ignoredTables` argument when instantiating the plugin. Kysely tables are always ignored.

```ts
export const db = new Kysely<DB>({
  // ...
  plugins:
    [
      new SoftDelete({ ignoredTables: ["no_updated_at_here", "i_aint_got_any_updated_at"] }),
      new AutoUpdatedAt({ ignoredTables: ["dont_soft_delete_me_please"] }),
    ],
});
```

### Is that code production ready?

Is any code? We use this code in production at my company.
