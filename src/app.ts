import configureOpenAPI from "./config/configure-open-api";
import createApp, { createRouter } from "./config/create-app";
import { seedRBAC } from "./db/seed-rbac";
import { AuthRoutes } from "./features/auth/auth.router";
import { v1Routes } from "./routes";
import { publicRoutes } from "./routes/public.routes";

const app = createApp();

configureOpenAPI(app);

const auth = new AuthRoutes();

app.route("/api/v1", v1Routes);
app.route("/public", auth.routes);

app.get("/api/rbac/seed", async (c) => {
  await seedRBAC();
  return c.text("RBAC seeded successfully");
});

app.get("/", (c) => {
  return c.text("SERVER IS RUNNING APP.TS ");
});

export { app };
