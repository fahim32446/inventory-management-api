import { serve } from "@hono/node-server";
import "dotenv/config";
import { app } from "./app";
import env from "./env";
const port = env.PORT;
console.log(`🚀 Server running at http://localhost:${port}`);
serve({ fetch: app.fetch, port });
