import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const pool = new Pool({
  // host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,
  connectionString:
    "postgres://neondb_owner:npg_aT8Ifpm1BgNZ@ep-gentle-truth-a10d3izh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle({ client: pool });

// Test DB connection
pool.on("connect", () => {
  console.log("Database is connected");
});
