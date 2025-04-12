import type { Kysely } from "kysely";

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createTable("dad")
    .addColumn("id", "serial", (cb) => cb.notNull().primaryKey())
    .addColumn("created_at", "timestamp", (cb) => cb.notNull().defaultTo("NOW()"))
    .addColumn("updated_at", "timestamp", (cb) => cb.notNull().defaultTo("NOW()"))
    .addColumn("deleted_at", "timestamp")
    .execute();

  await db.schema.createTable("mom")
    .addColumn("id", "serial", (cb) => cb.notNull().primaryKey())
    .addColumn("created_at", "timestamp", (cb) => cb.notNull().defaultTo("NOW()"))
    .addColumn("updated_at", "timestamp", (cb) => cb.notNull().defaultTo("NOW()"))
    .addColumn("deleted_at", "timestamp")
    .execute();

  await db.schema.createTable("child")
    .addColumn("id", "serial", (cb) => cb.notNull().primaryKey())
    .addColumn("created_at", "timestamp", (cb) => cb.notNull().defaultTo("NOW()"))
    .addColumn("updated_at", "timestamp", (cb) => cb.notNull().defaultTo("NOW()"))
    .addColumn("deleted_at", "timestamp")
    .addColumn("mom_id", "integer", cb => cb.notNull().references("mom.id"))
    .addColumn("dad_id", "integer", cb => cb.notNull().references("dad.id"))
    .execute();

}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("child").execute()
  await db.schema.dropTable("dad").execute()
  await db.schema.dropTable("mom").execute()
}
