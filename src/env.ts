import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

// Load and expand .env or .env.test based on NODE_ENV
expand(
  config({
    path: path.resolve(process.cwd(), process.env.NODE_ENV === "test" ? ".env.test" : ".env"),
  })
);

const envPath = path.resolve(process.cwd(), process.env.NODE_ENV === "test" ? ".env.test" : ".env");

expand(config({ path: envPath }));

console.log({ env: process.env.PORT });

// Define environment variable schema
const EnvSchema = z.object({
  NODE_ENV: z.enum(["test", "production"]).default("test"),
  PORT: z.coerce.number().default(9999),
  EMAIL_PASS: z.string(),
  EMAIL_USER: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string(),
  COOKIES_NAME: z.string(),
});

// Parse environment variables
const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!;

// Export inferred types
export type Env = z.infer<typeof EnvSchema>;
