import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

// Load and expand .env or .env.test based on NODE_ENV
expand(
  config({
    path: path.resolve(process.cwd(), ".env"),
  })
);

const envPath = path.resolve(process.cwd(), ".env");

expand(config({ path: envPath }));

// Define environment variable schema
const EnvSchema = z.object({
  NODE_ENV: z.enum(["test", "production"]).default("test"),
  PORT: z.coerce.number().default(5050),
  EMAIL_PASS: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.coerce.number().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().optional(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).optional(),
  DATABASE_URL: z
    .string()
    .optional()
    .default(
      "postgres://neondb_owner:npg_aT8Ifpm1BgNZ@ep-gentle-truth-a10d3izh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    ),
  JWT_SECRET: z.string().optional(),
  COOKIES_NAME: z.string().optional(),
});

// Parse environment variables
const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  // process.exit(1);
}

export default env!;

// Export inferred types
export type Env = z.infer<typeof EnvSchema>;
