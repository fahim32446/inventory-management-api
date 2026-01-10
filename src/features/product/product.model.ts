import { eq, getTableColumns } from "drizzle-orm";
import type { IProductType, IUpdateProductType } from "./product.schema";
import { AbstractModels } from "../../abstract/abstract.model";

export class ProductModel extends AbstractModels {
  async addProduct(body: IProductType & { orgId: number }) {
    const res = await this.query()
      .insert(this.table.products)
      .values(body)
      .returning()
      

    return res;
  }

  async updateProduct(body: IUpdateProductType & { orgId?: number }, id: number) {
    const res = await this.query()
      .update(this.table.products)
      .set(body)
      .where(eq(this.table.products.productId, id))
      .returning()
     

    return res;
  }

  async deleteProduct(id: number) {
    const res = await this.query()
      .delete(this.table.products)
      .where(eq(this.table.products.productId, id))
      .returning()
     
    return res;
  }
  async getProduct(ORG_ID: number, limit: number, offset: number) {
    const { orgId, ...rest } = getTableColumns(this.table.products);

    const res = await this.query()
      .select({ ...rest })
      .from(this.table.products)
      .where(eq(this.table.products.orgId, ORG_ID))
      .limit(limit)
      .offset(offset);

    return res;
  }

  async getTotalProduct(): Promise<number> {
    const res = await this.query().$count(this.table.products);
    return res;
  }
}
