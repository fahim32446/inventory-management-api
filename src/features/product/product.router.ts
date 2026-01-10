import { createRouter } from "../../config/create-app";
import { ProductSchema } from "./product.schema";
import { ProductService } from "./product.service";

export class ProductRouter {
  private service = new ProductService();
  private schema = new ProductSchema();

  public readonly routes = createRouter()
    .openapi(this.schema.addProduct, this.service.addProduct)
    .openapi(this.schema.updateProduct, this.service.updateProduct)
    .openapi(this.schema.deleteProduct, this.service.deleteProduct)
    .openapi(this.schema.getProduct, this.service.getProduct);
}
