import { handle } from "hono/aws-lambda";
import configureOpenAPI from "./config/configure-open-api";
import createApp from "./config/create-app";
import { seedRBAC } from "./db/seed-rbac";
import { v1Routes } from "./routes";

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

app.onError((err, c) => {
  console.error("GLOBAL ERROR:", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export const handler = handle(app);
