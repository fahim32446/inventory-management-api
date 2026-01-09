import { createRouter } from '@/config/create-app';
import { WarehousesSchema } from './warehouse.schema';
import { WarehouseService } from './warehouse.service';
export class WarehouseRouter {
    service = new WarehouseService();
    schema = new WarehousesSchema();
    routes = createRouter()
        .openapi(this.schema.addWarehouse, this.service.addWarehouse)
        .openapi(this.schema.updateWarehouse, this.service.updateWarehouse)
        .openapi(this.schema.deleteWarehouse, this.service.deleteWarehouse)
        .openapi(this.schema.getWarehouse, this.service.getWarehouse);
}
