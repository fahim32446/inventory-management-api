import { handle } from "hono/aws-lambda";
import configureOpenAPI from "./config/configure-open-api";
import createApp, { createRouter } from "./config/create-app";
import { seedRBAC } from "./db/seed-rbac";
import { HealthRoute } from "./features/health/health.router";
import { publicRoutes } from "./routes/public.routes";

const app = createApp();

configureOpenAPI(app);

app.get("/", (c) => {
  return c.text("Hello Hono aws lambda awsss!");
});

export const abcRoutes = createRouter();

abcRoutes.openapi(
  {
    method: "get",
    path: "/abc",
    responses: {
      200: { description: "abc" },
    },
  },
  (c) => c.text("ABC")
);

const health = new HealthRoute();

app.route("/", abcRoutes);
app.route("/health", health.routes);
app.route("/api/v1", publicRoutes);

app.get("/api/rbac/seed", async (c) => {
  await seedRBAC();
  return c.text("RBAC seeded successfully");
});

app.onError((err, c) => {
  console.error("GLOBAL ERROR:", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export const handler = handle(app);
