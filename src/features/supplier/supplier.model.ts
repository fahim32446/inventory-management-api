import { AbstractModels } from '@/abstract/abstract.model';
import type { ISupplierType, IUpdateSupplierType } from './supplier.schema';
import { eq, getTableColumns } from 'drizzle-orm';

export class SupplierModel extends AbstractModels {
  async addSupplier(body: ISupplierType & { orgId?: number }) {
    const res = await this.query()
      .insert(this.table.suppliers)
      .values(body)
      .returning()
      .then((rows) => rows[0]);

    return res;
  }

  async updateSupplier(body: IUpdateSupplierType & { orgId?: number }, id: number) {
    const res = await this.query()
      .update(this.table.suppliers)
      .set(body)
      .where(eq(this.table.suppliers.supId, id))
      .returning()
      .then((rows) => rows[0]);

    return res;
  }

  async deleteSupplier(id: number) {
    const res = await this.query()
      .delete(this.table.suppliers)
      .where(eq(this.table.suppliers.supId, id))
      .returning()
      .then((rows) => rows[0]);

    return res;
  }
  async getSupplier(ORG_ID: number, limit: number, offset: number) {
    const { orgId, ...rest } = getTableColumns(this.table.suppliers);

    const res = await this.query()
      .select({ ...rest })
      .from(this.table.suppliers)
      .where(eq(this.table.suppliers.orgId, ORG_ID))
      .limit(limit)
      .offset(offset);

    return res;
  }

  async getTotalSupplier(): Promise<number> {
    const res = await this.query().$count(this.table.suppliers);
    return res;
  }
}
