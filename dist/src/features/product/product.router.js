import { createRouter } from '@/config/create-app';
import { ProductSchema } from './product.schema';
import { ProductService } from './product.service';
export class ProductRouter {
    service = new ProductService();
    schema = new ProductSchema();
    routes = createRouter()
        .openapi(this.schema.addProduct, this.service.addProduct)
        .openapi(this.schema.updateProduct, this.service.updateProduct)
        .openapi(this.schema.deleteProduct, this.service.deleteProduct)
        .openapi(this.schema.getProduct, this.service.getProduct);
}
