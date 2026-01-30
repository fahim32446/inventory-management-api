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
