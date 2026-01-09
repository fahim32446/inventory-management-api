import { AbstractModels } from "abstract/abstract.model";

import { eq, getTableColumns } from "drizzle-orm";
import type { ICategoryType, IUpdateCategoryType } from "./category.schema";

export class CategoryModel extends AbstractModels {
  async addCategory(body: ICategoryType & { orgId: number }) {
    const res = await this.query()
      .insert(this.table.categories)
      .values(body)
      .returning()
      .then((rows) => {
        const { orgId, ...rest } = rows[0];
        return rest;
      });

    return res;
  }

  async updateCategory(body: IUpdateCategoryType & { orgId?: number }, id: number) {
    const res = await this.query()
      .update(this.table.categories)
      .set(body)
      .where(eq(this.table.categories.catId, id))
      .returning()
      .then((rows) => {
        const { orgId, ...rest } = rows[0];
        return rest;
      });

    return res;
  }

  async deleteCategory(id: number) {
    const res = await this.query()
      .delete(this.table.categories)
      .where(eq(this.table.categories.catId, id))
      .returning()
      .then((rows) => {
        const { orgId, ...rest } = rows[0];
        return rest;
      });

    return res;
  }
  async getCategory(ORG_ID: number, limit: number, offset: number) {
    const { orgId, ...rest } = getTableColumns(this.table.categories);

    const res = await this.query()
      .select({ ...rest })
      .from(this.table.categories)
      .where(eq(this.table.categories.orgId, ORG_ID))
      .limit(limit)
      .offset(offset);

    return res;
  }

  async getTotalCategory(): Promise<number> {
    const res = await this.query().$count(this.table.categories);
    return res;
  }
}
