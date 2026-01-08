import { createRouter } from '@/config/create-app';
import { administrationRouter } from '@/features/administration/administration.router';
import { CategoryRouter } from '@/features/category/category.router';
import { HealthRoute } from '@/features/health/health.router';
import { ProductRouter } from '@/features/product/product.router';
import { StockRouter } from '@/features/stock/stock.router';
import { SupplierRouter } from '@/features/supplier/supplier.router';
import { WarehouseRouter } from '@/features/warehouse/warehouse.router';
import { authMiddleware } from '@/middlewares/authMiddleware';

export const privateRoutes = createRouter();

privateRoutes.use('*', authMiddleware());

privateRoutes.route('/health', new HealthRoute().routes);
privateRoutes.route('/supplier', new SupplierRouter().routes);
privateRoutes.route('/warehouse', new WarehouseRouter().routes);
privateRoutes.route('/category', new CategoryRouter().routes);
privateRoutes.route('/product', new ProductRouter().routes);
privateRoutes.route('/stock', new StockRouter().routes);
privateRoutes.route('/administration', new administrationRouter().routes);
