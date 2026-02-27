import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { ZWarehouse } from "../../db/schema.type";
import { idParams } from "../../config/types";
import { checkPermission } from "../../middlewares/checkPermission";

export const ZUpdateWarehouses = ZWarehouse.partial();

export type IWarehousesType = z.infer<typeof ZWarehouse>;
export type IUpdateWarehousesType = z.infer<typeof ZUpdateWarehouses>;

export class WarehousesSchema {
  readonly addWarehouse = createRoute({
    path: "/",
    method: "post",
    tags: ["warehouse"],
    middleware: [checkPermission("warehouse:create")],
    security: [
      {
        bearerAuth: [],
      },
    ],
    request: { body: jsonContentRequired(ZWarehouse, "create warehouses") },
    responses: {
      [HttpStatusCodes.CREATED]: jsonContent(ZWarehouse, "Warehouses created response"),
    },
  });

  readonly getWarehouse = createRoute({
    path: "/",
    method: "get",
    middleware: [checkPermission("warehouse:read")],
    tags: ["warehouse"],
    security: [
      {
        bearerAuth: [],
      },
    ],
    request: {
      query: z.object({
        limit: z
          .string()
          .default("10")
          .transform((val) => (val ? parseInt(val) : 10)),
        offset: z
          .string()
          .default("0")
          .transform((val) => (val ? parseInt(val) : 0)),
      }),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          count: z.number(),
          result: z.array(ZWarehouse),
        }),
        "Warehouses fetched",
      ),

      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "No warehouses found",
      ),
    },
  });

  readonly updateWarehouse = createRoute({
    path: "/:id",
    method: "put",
    middleware: [checkPermission("warehouse:update")],
    tags: ["warehouse"],
    security: [
      {
        bearerAuth: [],
      },
    ],
    request: {
      params: idParams,
      body: jsonContentRequired(ZUpdateWarehouses, "Update warehouses"),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(ZWarehouse, "Warehouses updated"),
    },
  });

  readonly deleteWarehouse = createRoute({
    path: "/:id",
    method: "delete",
    middleware: [checkPermission("warehouse:delete")],
    tags: ["warehouse"],
    security: [
      {
        bearerAuth: [],
      },
    ],
    request: { params: idParams },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Warehouses deleted",
      ),
    },
  });
}

const instance = new WarehousesSchema();

export type IRAddWarehouseRoute = typeof instance.addWarehouse;
export type IRGetWarehouseRoute = typeof instance.getWarehouse;
export type IRUpdateWarehouseRoute = typeof instance.updateWarehouse;
export type IRDeleteWarehouseRoute = typeof instance.deleteWarehouse;
