import { createRouter } from "../config/create-app";
import { AuthRoutes } from "../features/auth/auth.router";

export const publicRoutes = createRouter();

const auth = new AuthRoutes();

publicRoutes.route("/auth", auth.routes);
