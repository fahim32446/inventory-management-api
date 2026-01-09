import { createRouter } from '@/config/create-app';
import { SupplierSchema } from './supplier.schema';
import { SupplierService } from './supplier.service';
export class SupplierRouter {
    service = new SupplierService();
    schema = new SupplierSchema();
    routes = createRouter()
        .openapi(this.schema.addSupplier, this.service.addSupplier)
        .openapi(this.schema.updateSupplier, this.service.updateSupplier)
        .openapi(this.schema.deleteSupplier, this.service.deleteSupplier)
        .openapi(this.schema.getSupplier, this.service.getSupplier);
}
