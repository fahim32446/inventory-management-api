import { AbstractModels } from '@/abstract/abstract.model';
import { eq, getTableColumns } from 'drizzle-orm';
export class CategoryModel extends AbstractModels {
    async addCategory(body) {
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
    async updateCategory(body, id) {
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
    async deleteCategory(id) {
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
    async getCategory(ORG_ID, limit, offset) {
        const { orgId, ...rest } = getTableColumns(this.table.categories);
        const res = await this.query()
            .select({ ...rest })
            .from(this.table.categories)
            .where(eq(this.table.categories.orgId, ORG_ID))
            .limit(limit)
            .offset(offset);
        return res;
    }
    async getTotalCategory() {
        const res = await this.query().$count(this.table.categories);
        return res;
    }
}
