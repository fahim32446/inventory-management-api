import { createRoute, z } from '@hono/zod-openapi';
import { count } from 'node:console';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';

export const PurchaseProduct = z.object({
  stock_product_id: z.number().optional(),
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  unitCost: z.number().min(0),
  subtotal: z.number().min(0),
  product_name: z.string().nullable(),
});
export const PurchaseItem = z.object({
  sales_item_id: z.number().optional(),
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  unitCost: z.number().min(0),
  subtotal: z.number().min(0),
});

export const PurchaseListSchema = z.object({
  purchaseId: z.number(),
  supplierId: z.number().nullable(),
  supplier_name: z.string().nullable(),
  sales_item_id: z.number().nullable(),
  purchaseDate: z.string(),
  productId: z.number().nullable(),
  product_name: z.string().nullable(),
  quantity: z.number().nullable(),
  unitCost: z.number().nullable(),
  subtotal: z.number().nullable(),
});

export const AddPurchaseBody = z.object({
  supplierId: z.number().int().positive().optional(),
  purchaseDate: z.string().datetime().nonempty(),
  items: z.array(PurchaseItem).nonempty(),
});

export const AddSaleBody = z.object({
  customerName: z.string().optional(),
  saleDate: z.string().datetime().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().min(0),
        subtotal: z.number().min(0),
      })
    )
    .nonempty(),
});

export const UpdateSaleBody = z.object({
  customerName: z.string().optional(),
  saleDate: z.string().datetime().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        purchase_item_id: z.number().int().positive(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().min(0),
        subtotal: z.number().min(0),
        stock: z.number().min(0),
        isDeleted: z.boolean().optional(),
      })
    )
    .nonempty(),
});

export const SaleList = z.object({
  saleId: z.number(),
  saleDate: z.string(),
  customerName: z.string().nullable().optional(),
  totalQuantity: z.number(),
  totalPrice: z.number(),
  items: z.array(
    z.object({
      salesItemId: z.number().nullable(),
      product_name: z.string().nullable(),
      quantity: z.number().nullable(),
      unitPrice: z.number().nullable(),
      subtotal: z.number().nullable(),
    })
  ),
});
export const StockReportItem = z.object({
  productId: z.number(),
  name: z.string(),
  totalPurchased: z.number(),
  totalSold: z.number(),
  currentStock: z.number(),
});

export const SalesReport = z.object({
  salesId: z.number(),
  purchaseId: z.number(),
  saleDate: z.string().nullable(),
  customerName: z.string().nullable(),
  salesQuantity: z.number().int().positive(),
  salesUnitPrice: z.number().min(0),
  purchaseUnitCost: z.number().nullable(),
  salesSubtotal: z.number().min(0),
});

export type IAddSaleBody = z.infer<typeof AddSaleBody>;
export type IUpdateSaleBody = z.infer<typeof UpdateSaleBody>;
export type IAddPurchaseBody = z.infer<typeof AddPurchaseBody>;
export type ISaleList = z.infer<typeof SaleList>;
export type ISaleReport = z.infer<typeof SalesReport>;

export const BasicResponse = z.object({
  purchaseId: z.number().optional(),
  message: z.string(),
});

export class StockSchema {
  readonly purchaseProductList = createRoute({
    path: '/product',
    method: 'get',
    tags: ['stock'],
    security: [{ bearerAuth: [] }],
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          count: z.number(),
          result: z.array(PurchaseProduct),
        }),
        'Purchase Lists'
      ),
    },
  });
  readonly purchaseList = createRoute({
    path: '/purchase',
    method: 'get',
    tags: ['stock'],
    security: [{ bearerAuth: [] }],
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          count: z.number(),
          result: z.array(PurchaseListSchema),
        }),
        'Purchase Lists'
      ),
    },
  });
  readonly addPurchase = createRoute({
    path: '/purchase',
    method: 'post',
    tags: ['stock'],
    security: [{ bearerAuth: [] }],
    request: {
      body: jsonContentRequired(AddPurchaseBody, 'Create a purchase'),
    },
    responses: {
      [HttpStatusCodes.CREATED]: jsonContent(BasicResponse, 'Purchase created successfully'),
    },
  });

  readonly updatePurchase = createRoute({
    path: '/purchase/{id}',
    method: 'put',
    tags: ['stock'],
    request: {
      params: z.object({ id: z.string() }),
      body: jsonContentRequired(AddPurchaseBody, 'Update purchase'),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(BasicResponse, 'Purchase updated'),
    },
  });

  readonly deletePurchase = createRoute({
    path: '/purchase/{id}',
    method: 'delete',
    tags: ['stock'],
    request: { params: z.object({ id: z.string() }) },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(BasicResponse, 'Purchase deleted'),
    },
  });

  readonly salesList = createRoute({
    path: '/sale',
    method: 'get',
    tags: ['stock'],
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          count: z.number(),
          result: z.array(SaleList),
        }),
        'Sale list'
      ),
    },
  });
  readonly addSale = createRoute({
    path: '/sale',
    method: 'post',
    tags: ['stock'],
    request: { body: jsonContentRequired(AddSaleBody, 'Create sale') },
    responses: {
      [HttpStatusCodes.CREATED]: jsonContent(BasicResponse, 'Sale created'),
    },
  });

  readonly updateSale = createRoute({
    path: '/sale/{id}',
    method: 'put',
    tags: ['stock'],
    request: {
      params: z.object({ id: z.string() }),
      body: jsonContentRequired(UpdateSaleBody, 'Update sale'),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(BasicResponse, 'Sale updated'),
    },
  });

  readonly getForEditSale = createRoute({
    path: '/sale/get-for-edit/{id}',
    method: 'get',
    tags: ['stock'],

    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          result: AddSaleBody,
        }),
        'Get for edit'
      ),
    },
  });

  readonly stockReport = createRoute({
    path: '/report/stock',
    method: 'get',
    tags: ['stock'],
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          count: z.number(),
          result: z.array(StockReportItem),
        }),

        'Stock report'
      ),
    },
  });

  readonly salesReport = createRoute({
    path: '/report/sales',
    method: 'get',
    tags: ['stock'],
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          count: z.number(),
          result: z.array(SalesReport),
        }),
        'Summary report'
      ),
    },
  });
}

const instance = new StockSchema();

export type IRPurchaseProductListRoute = typeof instance.purchaseProductList;
export type IRPurchaseListRoute = typeof instance.purchaseList;
export type IRSaleListRoute = typeof instance.salesList;
export type IRAddPurchaseRoute = typeof instance.addPurchase;
export type IRUpdatePurchaseRoute = typeof instance.updatePurchase;
export type IRDeletePurchaseRoute = typeof instance.deletePurchase;
export type IRAddSalesRoute = typeof instance.addSale;
export type IRUpdateSalesRoute = typeof instance.updateSale;
export type IRGetForEditSalesRoute = typeof instance.getForEditSale;
export type IRStockReportRoute = typeof instance.stockReport;
export type IRSalesReportRoute = typeof instance.salesReport;
