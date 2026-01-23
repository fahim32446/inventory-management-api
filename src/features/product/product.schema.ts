import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { ZProduct } from "../../db/schema.type";
import { idParams } from "../../config/types";

export const ZUpdateProduct = ZProduct.partial();

export type IProductType = z.infer<typeof ZProduct>;
export type IUpdateProductType = z.infer<typeof ZUpdateProduct>;

export class ProductSchema {
  readonly addProduct = createRoute({
    path: "/",
    method: "post",
    tags: ["product"],
    security: [
      {
        bearerAuth: [],
      },
    ],
    request: { body: jsonContentRequired(ZProduct, "create product") },
    responses: {
      [HttpStatusCodes.CREATED]: jsonContent(ZProduct, "Product created response"),
    },
  });

  readonly getProduct = createRoute({
    path: "/",
    method: "get",
    tags: ["product"],
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
          result: z.array(ZProduct),
        }),
        "Product fetched",
      ),

      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "No product found",
      ),
    },
  });

  readonly updateProduct = createRoute({
    path: "/:id",
    method: "put",
    tags: ["product"],
    security: [
      {
        bearerAuth: [],
      },
    ],
    request: {
      params: idParams,
      body: jsonContentRequired(ZUpdateProduct, "Update product"),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(ZProduct, "Product updated"),
    },
  });

  readonly deleteProduct = createRoute({
    path: "/:id",
    method: "delete",
    tags: ["product"],
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
        "Product deleted",
      ),
    },
  });
}

const instance = new ProductSchema();

export type IRAddProductRoute = typeof instance.addProduct;
export type IRGetProductRoute = typeof instance.getProduct;
export type IRUpdateProductRoute = typeof instance.updateProduct;
export type IRDeleteProductRoute = typeof instance.deleteProduct;
