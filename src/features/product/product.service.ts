import type { AppRouteHandler } from '@/config/types';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { ProductModel } from './product.model';
import {
  type IRAddProductRoute,
  type IRDeleteProductRoute,
  type IRGetProductRoute,
  type IRUpdateProductRoute,
} from './product.schema';

export class ProductService {
  private db_conn = new ProductModel();

  addProduct: AppRouteHandler<IRAddProductRoute> = async (c) => {
    const body = c.req.valid('json');
    const org = c.get('jwtPayload');

    const res = await this.db_conn.addProduct({ ...body, orgId: org.orgId });

    return c.json({ ...res }, HttpStatusCodes.CREATED);
  };

  updateProduct: AppRouteHandler<IRUpdateProductRoute> = async (c) => {
    const body = c.req.valid('json');
    const { id } = c.req.valid('param');
    const org = c.get('jwtPayload');

    const res = await this.db_conn.updateProduct({ ...body, orgId: org.orgId }, id);

    return c.json({ ...res }, HttpStatusCodes.OK);
  };

  deleteProduct: AppRouteHandler<IRDeleteProductRoute> = async (c) => {
    const { id } = c.req.valid('param');
    const org = c.get('jwtPayload');
    console.log({ id });

    await this.db_conn.deleteProduct(id);

    return c.json({ message: 'Product deleted' }, HttpStatusCodes.OK);
  };

  getProduct: AppRouteHandler<IRGetProductRoute> = async (c) => {
    const org = c.get('jwtPayload');
    const { limit, offset } = c.req.valid('query');

    console.log(org);
    

    const res = await this.db_conn.getProduct(org.orgId, limit, offset);
    const count = await this.db_conn.getTotalProduct();

    if (res.length === 0) {
      return c.json({ message: 'No product found' }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({   count, result: res }, HttpStatusCodes.OK);
  };
}
