import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

const cwd = process.cwd();

/**
 * Always load base .env
 */
expand(
  config({
    path: path.resolve(cwd, ".env"),
  }),
);

/**
 * Load .env.local ONLY in local/dev
 */
if (process.env.NODE_ENV === "local" || !process.env.NODE_ENV) {
  expand(
    config({
      path: path.resolve(cwd, ".env.local"),
      override: true,
    }),
  );
}

console.log({ env: process.env.NODE_ENV });

const EnvSchema = z.object({
  NODE_ENV: z.enum(["local", "test", "production"]).default("local"),

  PORT: z.coerce.number().default(5050),

  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string(),

  DB_HOST: z.string().optional(),
  DB_PORT: z.coerce.number().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().optional(),

  DATABASE_URL: z.string(),

  JWT_SECRET: z.string(),
  COOKIES_NAME: z.string(),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("debug"),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

export default env!;
export type Env = z.infer<typeof EnvSchema>;
