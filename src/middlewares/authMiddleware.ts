import type { MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import env from "../env";

export const authMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return c.json({ message: "Unauthorized: Missing or invalid token" }, 401);
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = await verify(token, env.JWT_SECRET!, "HS256");

      c.set("jwtPayload", payload);
      await next();
    } catch (err) {
      return c.json({ message: "You are not authorized" }, 401);
    }
  };
};
