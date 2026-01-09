import { idParams } from "@/config/types";
import { ZWarehouse } from "@/db/schema.type";
import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
export const ZUpdateWarehouses = ZWarehouse.partial();
export class WarehousesSchema {
    addWarehouse = createRoute({
        path: "/",
        method: "post",
        tags: ["warehouse"],
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
    getWarehouse = createRoute({
        path: "/",
        method: "get",
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
            [HttpStatusCodes.OK]: jsonContent(z.object({
                count: z.number(),
                result: z.array(ZWarehouse),
            }), "Warehouses fetched"),
            [HttpStatusCodes.NOT_FOUND]: jsonContent(z.object({
                message: z.string(),
            }), "No warehouses found"),
        },
    });
    updateWarehouse = createRoute({
        path: "/:id",
        method: "put",
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
    deleteWarehouse = createRoute({
        path: "/:id",
        method: "delete",
        tags: ["warehouse"],
        security: [
            {
                bearerAuth: [],
            },
        ],
        request: { params: idParams },
        responses: {
            [HttpStatusCodes.OK]: jsonContent(z.object({
                message: z.string(),
            }), "Warehouses deleted"),
        },
    });
}
const instance = new WarehousesSchema();
