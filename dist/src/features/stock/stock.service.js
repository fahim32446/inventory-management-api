import * as HttpStatusCodes from 'stoker/http-status-codes';
import { StockModel } from './stock.model';
export class StockService {
    db_conn = new StockModel();
    purchaseProductList = async (c) => {
        const org = c.get('jwtPayload');
        const result = await this.db_conn.purchaseProductList(org.orgId);
        return c.json({ count: result.length, result: result }, HttpStatusCodes.OK);
    };
    purchaseList = async (c) => {
        const org = c.get('jwtPayload');
        const result = await this.db_conn.purchaseList(org.orgId);
        return c.json({ count: result?.length, result: result }, HttpStatusCodes.OK);
    };
    addPurchase = async (c) => {
        const body = c.req.valid('json');
        const org = c.get('jwtPayload');
        const result = await this.db_conn.addPurchase({
            ...body,
            orgId: org.orgId,
        });
        return c.json(result, HttpStatusCodes.CREATED);
    };
    updatePurchase = async (c) => {
        const id = Number(c.req.param('id'));
        const body = c.req.valid('json');
        const result = await this.db_conn.updatePurchase(id, body);
        return c.json(result, HttpStatusCodes.OK);
    };
    deletePurchase = async (c) => {
        const id = Number(c.req.param('id'));
        const result = await this.db_conn.deletePurchase(id);
        return c.json(result, HttpStatusCodes.OK);
    };
    saleList = async (c) => {
        const org = c.get('jwtPayload');
        const result = await this.db_conn.salesList(org.orgId);
        const grouped = result?.reduce((acc, item) => {
            if (!acc[item.saleId]) {
                acc[item.saleId] = {
                    saleId: item.saleId,
                    saleDate: item.saleDate,
                    customerName: item?.customerName,
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
    getForEditSale = async (c) => {
        const org = c.get('jwtPayload');
        const id = Number(c.req.param('id'));
        const result = await this.db_conn.salesGetForEdit({ orgId: org.orgId, salesId: id });
        const sale = {
            saleId: result?.[0]?.saleId,
            saleDate: result?.[0]?.saleDate,
            customerName: result?.[0]?.customerName,
            items: result?.map((row) => ({
                sales_item_id: row?.sales_item_id,
                productId: row?.productId,
                quantity: row?.quantity,
                unitPrice: row?.unitPrice,
                subtotal: row?.subtotal,
            })),
        };
        return c.json({ result: sale }, HttpStatusCodes.OK);
    };
    addSale = async (c) => {
        const body = c.req.valid('json');
        const org = c.get('jwtPayload');
        const result = await this.db_conn.addSale({ ...body, orgId: org.orgId });
        return c.json(result, HttpStatusCodes.CREATED);
    };
    updateSale = async (c) => {
        const body = c.req.valid('json');
        const org = c.get('jwtPayload');
        const id = Number(c.req.param('id'));
        const result = await this.db_conn.updateSale({ ...body, orgId: org.orgId }, id);
        return c.json(result, HttpStatusCodes.OK);
    };
    stockReport = async (c) => {
        const org = c.get('jwtPayload');
        const data = await this.db_conn.getStockReport(org.orgId);
        return c.json({ count: data.length, result: data });
    };
    salesReport = async (c) => {
        const org = c.get('jwtPayload');
        const data = await this.db_conn.getSalesReport(org.orgId);
        return c.json({ count: data.length, result: data });
    };
}
