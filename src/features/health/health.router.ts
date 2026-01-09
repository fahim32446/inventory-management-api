import { createRouter } from "../../config/create-app";
import { HealthSchema } from "./health.schema";
import { HealthService } from "./health.service";

export class HealthRoute {
  private controller = new HealthService();
  private schema = new HealthSchema();

  public readonly routes = createRouter().openapi(
    this.schema.createHealth,
    this.controller.healthCheck
  );
}
