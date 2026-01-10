import { eq, getTableColumns } from "drizzle-orm";
import type { IUpdateWarehousesType, IWarehousesType } from "./warehouse.schema";
import { AbstractModels } from "../../abstract/abstract.model";

export class WarehouseModel extends AbstractModels {
  async addWarehouse(body: IWarehousesType & { orgId: number }) {
    const res = await this.query().insert(this.table.warehouses).values(body).returning();

    return res;
  }

  async updateWarehouse(body: IUpdateWarehousesType & { orgId?: number }, id: number) {
    const res = await this.query()
      .update(this.table.warehouses)
      .set(body)
      .where(eq(this.table.warehouses.whId, id))
      .returning();

    return res;
  }

  async deleteWarehouse(id: number) {
    const res = await this.query()
      .delete(this.table.warehouses)
      .where(eq(this.table.warehouses.whId, id))
      .returning();

    return res;
  }
  async getWarehouse(ORG_ID: number, limit: number, offset: number) {
    const { orgId, ...rest } = getTableColumns(this.table.warehouses);

    const res = await this.query()
      .select({ ...rest })
      .from(this.table.warehouses)
      .where(eq(this.table.warehouses.orgId, ORG_ID))
      .limit(limit)
      .offset(offset);

    return res;
  }

  async getTotalWarehouse(): Promise<number> {
    const res = await this.query().$count(this.table.warehouses);
    return res;
  }
}
