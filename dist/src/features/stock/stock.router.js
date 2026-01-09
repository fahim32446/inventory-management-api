import { createRouter } from '@/config/create-app';
import { StockService } from './stock.service';
import { StockSchema } from './stock.schema';
export class StockRouter {
    service = new StockService();
    schema = new StockSchema();
    routes = createRouter()
        .openapi(this.schema.purchaseProductList, this.service.purchaseProductList)
        .openapi(this.schema.purchaseList, this.service.purchaseList)
        .openapi(this.schema.addPurchase, this.service.addPurchase)
        .openapi(this.schema.addPurchase, this.service.addPurchase)
        .openapi(this.schema.updatePurchase, this.service.updatePurchase)
        .openapi(this.schema.deletePurchase, this.service.deletePurchase)
        .openapi(this.schema.salesList, this.service.saleList)
        .openapi(this.schema.getForEditSale, this.service.getForEditSale)
        .openapi(this.schema.addSale, this.service.addSale)
        .openapi(this.schema.updateSale, this.service.updateSale)
        .openapi(this.schema.stockReport, this.service.stockReport)
        .openapi(this.schema.salesReport, this.service.salesReport);
}
