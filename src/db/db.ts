import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import env from "../env";

export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === "production" ? true : false,
});

export const db = drizzle(pool);

// Test DB connection
pool.on("connect", () => {
  console.log("Database is connected");
});
