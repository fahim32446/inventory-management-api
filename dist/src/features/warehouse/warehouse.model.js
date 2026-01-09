import { AbstractModels } from '@/abstract/abstract.model';
import { eq, getTableColumns } from 'drizzle-orm';
export class WarehouseModel extends AbstractModels {
    async addWarehouse(body) {
        const res = await this.query()
            .insert(this.table.warehouses)
            .values(body)
            .returning()
            .then((rows) => {
            const { orgId, ...rest } = rows[0];
            return rest;
        });
        return res;
    }
    async updateWarehouse(body, id) {
        const res = await this.query()
            .update(this.table.warehouses)
            .set(body)
            .where(eq(this.table.warehouses.whId, id))
            .returning()
            .then((rows) => {
            const { orgId, ...rest } = rows[0];
            return rest;
        });
        return res;
    }
    async deleteWarehouse(id) {
        const res = await this.query()
            .delete(this.table.warehouses)
            .where(eq(this.table.warehouses.whId, id))
            .returning()
            .then((rows) => {
            const { orgId, ...rest } = rows[0];
            return rest;
        });
        return res;
    }
    async getWarehouse(ORG_ID, limit, offset) {
        const { orgId, ...rest } = getTableColumns(this.table.warehouses);
        const res = await this.query()
            .select({ ...rest })
            .from(this.table.warehouses)
            .where(eq(this.table.warehouses.orgId, ORG_ID))
            .limit(limit)
            .offset(offset);
        return res;
    }
    async getTotalWarehouse() {
        const res = await this.query().$count(this.table.warehouses);
        return res;
    }
}
