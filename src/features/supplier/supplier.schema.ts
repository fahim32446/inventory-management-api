import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { ZSupplier } from "../../db/schema.type";
import { idParams } from "../../config/types";

export const ZUpdateSupplier = ZSupplier.partial();

export type ISupplierType = z.infer<typeof ZSupplier>;
export type IUpdateSupplierType = z.infer<typeof ZUpdateSupplier>;

export class SupplierSchema {
  readonly addSupplier = createRoute({
    path: "/",
    method: "post",
    tags: ["supplier"],
    security: [
      {
        bearerAuth: [],
      },
    ],
    request: { body: jsonContentRequired(ZSupplier, "create supplier") },
    responses: {
      [HttpStatusCodes.CREATED]: jsonContent(ZSupplier, "Supplier created response"),
    },
  });

  readonly getSupplier = createRoute({
    path: "/",
    method: "get",
    tags: ["supplier"],
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
          result: z.array(ZSupplier),
        }),
        "Supplier fetched"
      ),

      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "No supplier found"
      ),
    },
  });

  readonly updateSupplier = createRoute({
    path: "/:id",
    method: "put",
    tags: ["supplier"],
    security: [
      {
        bearerAuth: [],
      },
    ],
    request: {
      params: idParams,
      body: jsonContentRequired(ZUpdateSupplier, "Update supplier"),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(ZSupplier, "Supplier updated"),
    },
  });

  readonly deleteSupplier = createRoute({
    path: "/:id",
    method: "delete",
    tags: ["supplier"],
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
        "Supplier deleted"
      ),
    },
  });
}

const instance = new SupplierSchema();

export type IAddSupplierRoute = typeof instance.addSupplier;
export type IGetSupplierRoute = typeof instance.getSupplier;
export type IUpdateSupplierRoute = typeof instance.updateSupplier;
export type IDeleteSupplierRoute = typeof instance.deleteSupplier;
