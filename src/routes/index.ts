import { createRouter } from "../config/create-app";
import { privateRoutes } from "./private.routes";
import { publicRoutes } from "./public.routes";

export const v1Routes = createRouter();

v1Routes.route("/public", publicRoutes);
v1Routes.route("/", privateRoutes);
