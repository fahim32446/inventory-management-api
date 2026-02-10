import { eq, sql, desc } from "drizzle-orm";
import { AbstractModels } from "../../abstract/abstract.model";

export class DashboardModel extends AbstractModels {
  async getRevenue(orgId: number) {
    const res = await this.query()
      .select({
        total: sql<number>`COALESCE(SUM(${this.table.saleItems.subtotal}), 0)`,
      })
      .from(this.table.sales)
      .innerJoin(this.table.saleItems, eq(this.table.sales.saleId, this.table.saleItems.saleId))
      .where(eq(this.table.sales.orgId, orgId));

    return res[0]?.total || 0;
  }

  async getExpenses(orgId: number) {
    const res = await this.query()
      .select({
        total: sql<number>`COALESCE(SUM(${this.table.purchaseItems.subtotal}), 0)`,
      })
      .from(this.table.purchases)
      .innerJoin(
        this.table.purchaseItems,
        eq(this.table.purchases.purchaseId, this.table.purchaseItems.purchaseId),
      )
      .where(eq(this.table.purchases.orgId, orgId));

    return res[0]?.total || 0;
  }

  async getMonthlyCashFlow(orgId: number) {
    const inflows = await this.query()
      .select({
        month: sql<string>`TO_CHAR(${this.table.sales.saleDate}, 'Mon')`,
        monthNum: sql<number>`EXTRACT(MONTH FROM ${this.table.sales.saleDate})`,
        amount: sql<number>`SUM(${this.table.saleItems.subtotal})`,
      })
      .from(this.table.sales)
      .innerJoin(this.table.saleItems, eq(this.table.sales.saleId, this.table.saleItems.saleId))
      .where(eq(this.table.sales.orgId, orgId))
      .groupBy(
        sql`TO_CHAR(${this.table.sales.saleDate}, 'Mon'), EXTRACT(MONTH FROM ${this.table.sales.saleDate})`,
      )
      .orderBy(sql`EXTRACT(MONTH FROM ${this.table.sales.saleDate})`);

    const outflows = await this.query()
      .select({
        month: sql<string>`TO_CHAR(${this.table.purchases.purchaseDate}, 'Mon')`,
        monthNum: sql<number>`EXTRACT(MONTH FROM ${this.table.purchases.purchaseDate})`,
        amount: sql<number>`SUM(${this.table.purchaseItems.subtotal})`,
      })
      .from(this.table.purchases)
      .innerJoin(
        this.table.purchaseItems,
        eq(this.table.purchases.purchaseId, this.table.purchaseItems.purchaseId),
      )
      .where(eq(this.table.purchases.orgId, orgId))
      .groupBy(
        sql`TO_CHAR(${this.table.purchases.purchaseDate}, 'Mon'), EXTRACT(MONTH FROM ${this.table.purchases.purchaseDate})`,
      )
      .orderBy(sql`EXTRACT(MONTH FROM ${this.table.purchases.purchaseDate})`);

    return { inflows, outflows };
  }

  async getRevenueByCategories(orgId: number) {
    return await this.query()
      .select({
        name: this.table.categories.name,
        value: sql<number>`SUM(${this.table.saleItems.subtotal})`,
      })
      .from(this.table.saleItems)
      .innerJoin(this.table.sales, eq(this.table.saleItems.saleId, this.table.sales.saleId))
      .innerJoin(
        this.table.products,
        eq(this.table.saleItems.productId, this.table.products.productId),
      )
      .innerJoin(this.table.categories, eq(this.table.products.catId, this.table.categories.catId))
      .where(eq(this.table.sales.orgId, orgId))
      .groupBy(this.table.categories.name);
  }

  async getRecentTransactions(orgId: number) {
    const lastSales = await this.query()
      .select({
        id: sql<string>`CAST(${this.table.sales.saleId} AS TEXT)`,
        date: this.table.sales.saleDate,
        customer: this.table.sales.customerName,
        amount: sql<number>`(SELECT SUM(${this.table.saleItems.subtotal}) FROM ${this.table.saleItems} WHERE ${this.table.saleItems.saleId} = ${this.table.sales.saleId})`,
        status: sql<string>`'completed'`,
        type: sql<string>`'Inbound'`,
      })
      .from(this.table.sales)
      .where(eq(this.table.sales.orgId, orgId))
      .orderBy(desc(this.table.sales.saleDate))
      .limit(5);

    const lastPurchases = await this.query()
      .select({
        id: sql<string>`${this.table.purchases.invoiceNo}`,
        date: this.table.purchases.purchaseDate,
        customer: this.table.suppliers.name,
        amount: sql<number>`- (SELECT SUM(${this.table.purchaseItems.subtotal}) FROM ${this.table.purchaseItems} WHERE ${this.table.purchaseItems.purchaseId} = ${this.table.purchases.purchaseId})`,
        status: sql<string>`'completed'`,
        type: sql<string>`'Outbound'`,
      })
      .from(this.table.purchases)
      .leftJoin(
        this.table.suppliers,
        eq(this.table.purchases.supplierId, this.table.suppliers.supId),
      )
      .where(eq(this.table.purchases.orgId, orgId))
      .orderBy(desc(this.table.purchases.purchaseDate))
      .limit(5);

    return [...lastSales, ...lastPurchases]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }
}
