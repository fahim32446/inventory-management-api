import type { db } from '@/db/db';
import {
  z,
  type OpenAPIHono,
  type RouteConfig,
  type RouteHandler,
} from '@hono/zod-openapi';
import type { Schema } from 'hono';
import type { PinoLogger } from 'hono-pino';

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
}

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;

export type Transaction = Parameters<typeof db.transaction>[0] extends (
  tx: infer T
) => any
  ? T
  : never;

export const idParams = z.object({
  id: z.preprocess(
    (val) => (typeof val === 'string' ? Number(val) : val),
    z.number().int().positive()
  ),
});
