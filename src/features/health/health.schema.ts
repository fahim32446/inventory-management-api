import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { IHealthLog } from "../../db/schema.type";

export class HealthSchema {
  public readonly createHealth = createRoute({
    path: "/",
    method: "get",
    tags: ["health"],
    security: [
      {
        bearerAuth: [],
      },
    ],
    request: {},
    responses: {
      [HttpStatusCodes.OK]: jsonContent(IHealthLog, "Insert to db for test purpose"),
    },
  });
}

const instance = new HealthSchema();
export type ICreateHealth = typeof instance.createHealth;
