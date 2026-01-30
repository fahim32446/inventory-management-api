import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { notFound, onError } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import type { AppBindings } from "./types";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();

  app.use(
    "*",
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:6565",
        "https://inventory-management-client-tau.vercel.app",
      ],
      allowHeaders: ["Content-Type", "Authorization", "X-Custom-Header"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      credentials: true,
    }),
  );

  app.use(logger());

  app.notFound(notFound);
  app.onError((err, c) => {
    console.error("🔥 Server Error:", err);

    return onError(err, c);
  });

  return app;
}
