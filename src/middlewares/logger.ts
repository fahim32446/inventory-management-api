import type { MiddlewareHandler } from 'hono';

export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
};
