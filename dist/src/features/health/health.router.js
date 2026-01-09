import { createRouter } from '@/config/create-app';
import { HealthSchema } from './health.schema';
import { HealthService } from './health.service';
export class HealthRoute {
    controller = new HealthService();
    schema = new HealthSchema();
    routes = createRouter().openapi(this.schema.createHealth, this.controller.healthCheck);
}
