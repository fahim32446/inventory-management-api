import { createRouter } from "../config/create-app";
import { AuthRoutes } from "../features/auth/auth.router";
import { HealthRoute } from "../features/health/health.router";

export const publicRoutes = createRouter();

const auth = new AuthRoutes();

publicRoutes.route("/auth", auth.routes);
publicRoutes.route("/health", new HealthRoute().routes);
