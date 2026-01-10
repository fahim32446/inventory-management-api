import * as HttpStatusCodes from "stoker/http-status-codes";
import { StockModel } from "./stock.model";
import type {
  IRAddPurchaseRoute,
  IRAddSalesRoute,
  IRDeletePurchaseRoute,
  IRGetForEditSalesRoute,
  IRPurchaseListRoute,
  IRPurchaseProductListRoute,
  IRSaleListRoute,
  IRStockReportRoute,
  IRSalesReportRoute,
  IRUpdatePurchaseRoute,
  IRUpdateSalesRoute,
  ISaleList,
} from "./stock.schema";
import { AppRouteHandler } from "../../config/types";

export class StockService {
  private db_conn = new StockModel();

  purchaseProductList: AppRouteHandler<IRPurchaseProductListRoute> = async (c) => {
    const org = c.get("jwtPayload");

    const result = await this.db_conn.purchaseProductList(org.orgId);

    return c.json({ count: result.length, result: result }, HttpStatusCodes.OK);
  };

  purchaseList: AppRouteHandler<IRPurchaseListRoute> = async (c) => {
    const org = c.get("jwtPayload");

    const result = await this.db_conn.purchaseList(org.orgId);

    return c.json({ count: result?.length, result: result }, HttpStatusCodes.OK);
  };
  addPurchase: AppRouteHandler<IRAddPurchaseRoute> = async (c) => {
    const body = c.req.valid("json");
    const org = c.get("jwtPayload");

    const result = await this.db_conn.addPurchase({
      ...body,
      orgId: org.orgId,
    });

    return c.json(result, HttpStatusCodes.CREATED);
  };

  updatePurchase: AppRouteHandler<IRUpdatePurchaseRoute> = async (c) => {
    const id = Number(c.req.param("id"));
    const body = c.req.valid("json");

    const result = await this.db_conn.updatePurchase(id, body);
    return c.json(result, HttpStatusCodes.OK);
  };

  deletePurchase: AppRouteHandler<IRDeletePurchaseRoute> = async (c) => {
    const id = Number(c.req.param("id"));
    const result = await this.db_conn.deletePurchase(id);
    return c.json(result, HttpStatusCodes.OK);
  };

  saleList: AppRouteHandler<IRSaleListRoute> = async (c) => {
    const org = c.get("jwtPayload");

    const result = await this.db_conn.salesList(org.orgId);

    const grouped = result?.reduce<Record<number, ISaleList>>((acc, item) => {
      if (!acc[item.saleId]) {
        acc[item.saleId] = {
          saleId: item.saleId,
          saleDate: item.saleDate,
          customerName: item?.customerName!,
          totalPrice: 0,
          totalQuantity: 0,
          items: [],
        };
      }

      acc[item.saleId].items.push({
        salesItemId: item.salesItemId,
        product_name: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      });
      acc[item.saleId].totalPrice += item.subtotal ?? 0;
      acc[item.saleId].totalQuantity += item.quantity ?? 0;

      return acc;
    }, {});

    return c.json({ count: result.length, result: Object.values(grouped) }, HttpStatusCodes.OK);
  };

  getForEditSale: AppRouteHandler<IRGetForEditSalesRoute> = async (c) => {
    const org = c.get("jwtPayload");
    const id = Number(c.req.param("id"));

    const result = await this.db_conn.salesGetForEdit({ orgId: org.orgId, salesId: id });

    const sale = {
      saleId: result?.[0]?.saleId,
      saleDate: result?.[0]?.saleDate,
      customerName: result?.[0]?.customerName,
      items: result?.map((row: any) => ({
        sales_item_id: row?.sales_item_id,
        productId: row?.productId,
        quantity: row?.quantity,
        unitPrice: row?.unitPrice,
        subtotal: row?.subtotal,
      })),
    } as any;
    return c.json({ result: sale as any }, HttpStatusCodes.OK);
  };

  addSale: AppRouteHandler<IRAddSalesRoute> = async (c) => {
    const body = c.req.valid("json");
    const org = c.get("jwtPayload");

    const result = await this.db_conn.addSale({ ...body, orgId: org.orgId });
    return c.json(result, HttpStatusCodes.CREATED);
  };

  updateSale: AppRouteHandler<IRUpdateSalesRoute> = async (c) => {
    const body = c.req.valid("json");
    const org = c.get("jwtPayload");
    const id = Number(c.req.param("id"));
    const result = await this.db_conn.updateSale({ ...body, orgId: org.orgId }, id);
    return c.json(result, HttpStatusCodes.OK);
  };

  stockReport: AppRouteHandler<IRStockReportRoute> = async (c) => {
    const org = c.get("jwtPayload");
    const data = await this.db_conn.getStockReport(org.orgId);
    return c.json({ count: data.length, result: data });
  };

  salesReport: AppRouteHandler<IRSalesReportRoute> = async (c) => {
    const org = c.get("jwtPayload");
    const data = await this.db_conn.getSalesReport(org.orgId);

    return c.json({ count: data.length, result: data });
  };
}
