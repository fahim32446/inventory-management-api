import { z, type OpenAPIHono, type RouteConfig, type RouteHandler } from "@hono/zod-openapi";
import type { Schema } from "hono";
import type { PinoLogger } from "hono-pino";
import { db } from "../db/db";

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
    clientIp: string;
    jwtPayload: any;
  };
}

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export type Transaction = Parameters<typeof db.transaction>[0] extends (tx: infer T) => any
  ? T
  : never;

export const idParams = z.object({
  id: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number().int().positive(),
  ),
});

export const ApiResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: dataSchema,
  });

export type PERMISSION_TYPE =
  | "sale:create"
  | "sale:read"
  | "sale:create"
  | "sale:read"
  | "sale:update"
  | "sale:delete"
  | "dashboard:read"
  | "products:create"
  | "products:read"
  | "products:update"
  | "products:delete"
  | "category:create"
  | "category:read"
  | "category:update"
  | "category:delete"
  | "warehouse:create"
  | "warehouse:read"
  | "warehouse:update"
  | "warehouse:delete"
  | "suppliers:create"
  | "suppliers:read"
  | "suppliers:update"
  | "suppliers:delete"
  | "purchase:create"
  | "purchase:read"
  | "purchase:update"
  | "purchase:delete"
  | "report:read"
  | "administration:read"
  | "administration:update"
  | "administration:users:create"
  | "administration:users:read"
  | "administration:users:update"
  | "administration:users:delete"
  | "administration:roles:create"
  | "administration:roles:read"
  | "administration:roles:update"
  | "administration:roles:delete";
