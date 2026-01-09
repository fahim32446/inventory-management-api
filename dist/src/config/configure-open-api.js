import { Scalar } from "@scalar/hono-api-reference";
import packageJSON from "../../package.json";
import { bearerAuthScheme } from "./security";
export default function configureOpenAPI(app) {
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
    app.get("/reference", Scalar({
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
                },
            },
        },
    }));
}
