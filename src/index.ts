import { handle } from "hono/aws-lambda";
import configureOpenAPI from "./config/configure-open-api";
import createApp from "./config/create-app";
import { seedRBAC } from "./db/seed-rbac";
import { v1Routes } from "./routes";

// Global error listeners for catching crashes outside Hono's request cycle
// These will show up in CloudWatch logs even if the function 502s
process.on("uncaughtException", (err) => {
  console.error("CRITICAL: Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("CRITICAL: Unhandled Rejection at:", promise, "reason:", reason);
});

const app = createApp();

configureOpenAPI(app);

app.get("/", (c) => {
  return c.text("Hello Hono aws lambda awsss!");
});

app.route("/api/v1", v1Routes);

app.get("/api/rbac/seed", async (c) => {
  await seedRBAC();
  return c.text("RBAC seeded successfully");
});

// The app already has an onError in createApp(),
// but we keep this here as a final fallback.
app.onError((err, c) => {
  console.error("FINAL FALLBACK ERROR:", err);
  return c.json(
    {
      success: false,
      message: err instanceof Error ? err.message : "Internal Server Error",
    },
    500,
  );
});

export const handler = handle(app);
