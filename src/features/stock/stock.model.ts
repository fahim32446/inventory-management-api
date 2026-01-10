import { and, eq, getTableColumns, sql } from "drizzle-orm";
import type { IAddPurchaseBody, IAddSaleBody, IUpdateSaleBody } from "./stock.schema";
import { AbstractModels } from "../../abstract/abstract.model";
import { products, purchaseItems, purchases, saleItems, sales } from "../../db/schema";

export class StockModel extends AbstractModels {
  async purchaseProductList(orgId: number) {
    const { quantity, subtotal, unitCost, productId, id } = getTableColumns(
      this.table.purchaseItems
    );
    const { name: product_name } = getTableColumns(this.table.products);

    const result = await this.db
      .select({
        stock_product_id: id,
        productId,
        product_name,
        quantity,
        unitCost,
        subtotal,
      })
      .from(this.table.purchaseItems)
      .leftJoin(
        this.table.products,
        eq(this.table.products.productId, this.table.purchaseItems.productId)
      );

    return result;
  }

  async purchaseList(orgId: number) {
    const { supplierId, purchaseId, purchaseDate } = getTableColumns(this.table.purchases);
    const { name } = getTableColumns(this.table.suppliers);
    const { quantity, subtotal, unitCost, productId, id } = getTableColumns(
      this.table.purchaseItems
    );
    const { name: product_name } = getTableColumns(this.table.products);

    const result = await this.db
      .select({
        purchaseId,
        supplierId,
        supplier_name: name,
        purchaseDate,
        sales_item_id: id,
        productId,
        product_name,
        quantity,
        unitCost,
        subtotal,
      })
      .from(this.table.purchases)
      .where(eq(purchases.orgId, orgId))
      .leftJoin(
        this.table.suppliers,
        eq(this.table.purchases.supplierId, this.table.suppliers.supId)
      )
      .leftJoin(
        this.table.purchaseItems,
        eq(this.table.purchases.purchaseId, this.table.purchaseItems.purchaseId)
      )
      .leftJoin(
        this.table.products,
        eq(this.table.products.productId, this.table.purchaseItems.productId)
      );

    return result;
  }

  async addPurchase(body: IAddPurchaseBody & { orgId: number }) {
    const { items, supplierId, orgId } = body;
    return await this.db.transaction(async (tx) => {
      const [purchase] = await tx
        .insert(purchases)
        .values({
          supplierId,
          orgId,
        })
        .returning({ purchaseId: purchases.purchaseId });

      for (const item of items) {
        await tx.insert(purchaseItems).values({
          purchaseId: purchase.purchaseId,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          subtotal: item.subtotal,
        });
      }

      return {
        purchaseId: purchase.purchaseId,
        message: "Purchase created and stock updated successfully",
      };
    });
  }

  async updatePurchase(id: number, body: IAddPurchaseBody) {
    const { items, supplierId } = body;

    const sales_item_id = body.items[0].sales_item_id;

    return await this.db.transaction(async (tx) => {
      await tx
        .update(this.table.purchases)
        .set({ supplierId })
        .where(eq(this.table.purchases.purchaseId, id));
      await tx
        .delete(this.table.purchaseItems)
        .where(eq(this.table.purchaseItems.id, sales_item_id!));
      for (const item of items) {
        await tx.insert(purchaseItems).values({ purchaseId: id, ...item });
      }
      return { purchaseId: id, message: "Purchase updated" };
    });
  }

  async deletePurchase(id: number) {
    await this.query().delete(purchases).where(eq(purchases.purchaseId, id));
    return { message: "Purchase deleted" };
  }

  async salesGetForEdit({ orgId, salesId }: { orgId: number; salesId: number }) {
    const { saleDate, customerName, saleId } = getTableColumns(this.table.sales);
    const { productId, quantity, unitPrice, subtotal, id } = getTableColumns(this.table.saleItems);
    const result = await this.query()
      .select({
        saleId,
        saleDate,
        customerName,
        productId,
        quantity,
        unitPrice,
        subtotal,
        sales_item_id: id,
      })
      .from(this.table.sales)
      .where(and(eq(this.table.sales.saleId, salesId), eq(sales.orgId, orgId)))
      .leftJoin(this.table.saleItems, eq(this.table.sales.saleId, this.table.saleItems.saleId));

    return result;
  }
  async addSale(body: IAddSaleBody & { orgId: number }) {
    const { items, orgId, customerName, saleDate } = body;
    return await this.db.transaction(async (tx) => {
      const [sale] = await tx
        .insert(this.table.sales)
        .values({ orgId, customerName, saleDate: saleDate })
        .returning({ saleId: sales.saleId });

      for (const item of items) {
        await tx.insert(saleItems).values({
          saleId: sale.saleId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        });

        await tx
          .update(purchaseItems)
          .set({
            quantity: sql`${purchaseItems.quantity} - ${item.quantity}`,
          })
          .where(eq(purchaseItems.id, item.productId));
      }

      return { id: sale.saleId, message: "Sale created" };
    });
  }

  async updateSale(body: IUpdateSaleBody & { orgId: number }, saleId: number) {
    const { items, orgId, customerName, saleDate } = body;
    return await this.db.transaction(async (tx) => {
      await tx
        .update(this.table.sales)
        .set({ customerName, saleDate: saleDate })
        .where(and(eq(this.table.sales.saleId, saleId), eq(sales.orgId, orgId)));

      for (const item of items) {
        if (item.isDeleted) {
          await tx
            .update(purchaseItems)
            .set({
              quantity: sql`${purchaseItems.quantity} + ${item.quantity}`,
            })
            .where(eq(purchaseItems.id, item.productId));

          await tx
            .delete(this.table.saleItems)
            .where(eq(this.table.saleItems.id, item.purchase_item_id!));
        } else {
          await tx
            .update(this.table.saleItems)
            .set({
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
            })
            .where(eq(this.table.saleItems.id, item.purchase_item_id!));

          await tx
            .update(purchaseItems)
            .set({
              quantity: item.stock,
            })
            .where(eq(purchaseItems.id, item.productId));
        }
      }

      return { id: saleId, message: "Sale created" };
    });
  }

  async salesList(orgId: number) {
    const { saleDate, customerName, saleId } = getTableColumns(this.table.sales);
    const { name: product_name } = getTableColumns(this.table.products);
    const {
      id: salesItemId,
      subtotal,
      unitPrice,
      quantity,
    } = getTableColumns(this.table.saleItems);

    const result = await this.db
      .select({
        saleId,
        salesItemId,
        saleDate,
        customerName,
        product_name,
        quantity,
        unitPrice,
        subtotal,
      })
      .from(this.table.sales)
      .where(eq(this.table.sales.orgId, orgId))
      .leftJoin(this.table.saleItems, eq(this.table.sales.saleId, this.table.saleItems.saleId))
      .leftJoin(
        this.table.purchaseItems,
        eq(this.table.purchaseItems.id, this.table.saleItems.productId)
      )
      .leftJoin(
        this.table.products,
        eq(this.table.products.productId, this.table.purchaseItems.productId)
      );

    return result;
  }

  async getStockReport(orgId: number) {
    const products = this.table.products;
    const pi = this.table.purchaseItems;
    const si = this.table.saleItems;

    const result = await this.db
      .select({
        productId: products.productId,
        name: products.name,
        totalPurchased: sql<number>`COALESCE(SUM(${pi.quantity}), 0)`,
        totalSold: sql<number>`COALESCE(SUM(${si.quantity}), 0)`,

        currentStock: sql<number>`
        COALESCE(SUM(${pi.quantity}), 0)
      - COALESCE(SUM(${si.quantity}), 0)
    `,
      })
      .from(products)
      .where(eq(products.orgId, orgId))
      .leftJoin(pi, eq(products.productId, pi.productId))
      .leftJoin(si, eq(pi.id, si.productId))
      .groupBy(products.productId, products.name);

    return result;
  }

  // 📈 Sales Report
  async getSalesReport(orgId: number) {
    const sales = this.table.sales;
    const pi = this.table.purchaseItems;
    const result = await this.db
      .select({
        salesId: this.table.saleItems.saleId,
        purchaseId: this.table.saleItems.productId,
        saleDate: sales.saleDate,
        customerName: sales.customerName,
        salesQuantity: this.table.saleItems.quantity,
        salesUnitPrice: this.table.saleItems.unitPrice,
        purchaseUnitCost: pi.unitCost,
        salesSubtotal: this.table.saleItems.subtotal,
      })
      .from(this.table.saleItems)
      .where(eq(sales.orgId, orgId))
      .leftJoin(pi, eq(this.table.saleItems.productId, pi.id))
      .leftJoin(sales, eq(this.table.saleItems.saleId, sales.saleId));

    return result;
  }
}
