import type { MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import env from "../env";
import { getCookie } from "hono/cookie";
import { db } from "../db/db";
import { sessions } from "../db/schema";
import { eq } from "drizzle-orm";

export const authMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");
    const refreshToken = getCookie(c, env.COOKIES_NAME!);

    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ message: "Unauthorized: Missing token" }, 401);
    }

    if (!refreshToken) {
      return c.json({ message: "Unauthorized: Missing session" }, 401);
    }

    const token = authHeader.split(" ")[1];

    let payload;
    try {
      payload = await verify(token, env.JWT_SECRET!, "HS256");
    } catch {
      return c.json({ message: "Token expired" }, 401);
    }

    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.refreshToken, refreshToken))
      .limit(1)
      .then((r) => r[0]);

    if (!session?.id) {
      return c.json({ message: "Session revoked" }, 401);
    }

    c.set("jwtPayload", payload);
    await next();
  };
};
