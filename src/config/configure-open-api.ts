import { Scalar } from "@scalar/hono-api-reference";
import packageJSON from "../../package.json";
import type { AppOpenAPI } from "./types";
import { bearerAuthScheme } from "./security";

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Tasks API",
    },
    security: [{ bearerAuth: [] }],
  });

  app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", bearerAuthScheme);

  // Register the Scalar API reference

  app.get(
    "/reference",
    Scalar({
      url: "/doc",
      theme: "kepler",
      layout: "modern",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },

      authentication: {
        preferredSecurityScheme: "bearerAuth",
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",

            initialValue:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjM5LCJvcmdJZCI6NCwiZW1haWwiOiJmYWhpbUBnbWFpbC5jb20iLCJleHAiOjE3NTE5OTI3Mjh9.J0Nxv6hNCkwXNbDu8Fm8I7mOkvdMMj3Ssbu4iP1sLQI",
            defaultValue:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjM5LCJvcmdJZCI6NCwiZW1haWwiOiJmYWhpbUBnbWFpbC5jb20iLCJleHAiOjE3NTE5OTI3Mjh9.J0Nxv6hNCkwXNbDu8Fm8I7mOkvdMMj3Ssbu4iP1sLQI",
            value:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjM5LCJvcmdJZCI6NCwiZW1haWwiOiJmYWhpbUBnbWFpbC5jb20iLCJleHAiOjE3NTE5OTI3Mjh9.J0Nxv6hNCkwXNbDu8Fm8I7mOkvdMMj3Ssbu4iP1sLQI",
          },
        },
      },
    })
  );
}
