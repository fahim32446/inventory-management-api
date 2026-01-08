import { createRouter } from '@/config/create-app';
import { CategoryService } from './category.service';
import { CategorySchema } from './category.schema';

export class CategoryRouter {
  private service = new CategoryService();
  private schema = new CategorySchema();

  public readonly routes = createRouter()
    .openapi(this.schema.addCategory, this.service.addCategory)
    .openapi(this.schema.updateCategory, this.service.updateCategory)
    .openapi(this.schema.deleteCategory, this.service.deleteCategory)
    .openapi(this.schema.getCategory, this.service.getCategory);
}
