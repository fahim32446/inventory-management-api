import { createRouter } from "../../config/create-app";
import { DashboardSchema } from "./dashboard.schema";
import { DashboardService } from "./dashboard.service";

export class DashboardRouter {
  private service = new DashboardService();
  private schema = new DashboardSchema();

  public readonly routes = createRouter().openapi(
    this.schema.getAnalytics,
    this.service.getAnalytics,
  );
}
