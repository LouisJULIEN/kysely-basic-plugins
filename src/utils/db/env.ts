import dotenv from "dotenv";

dotenv.config();
export const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:@localhost:5432/kysely_plugins";
