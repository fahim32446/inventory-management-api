import * as HttpStatusCodes from 'stoker/http-status-codes';
import { WarehouseModel } from './warehouse.model';
export class WarehouseService {
    db_conn = new WarehouseModel();
    addWarehouse = async (c) => {
        const body = c.req.valid('json');
        const org = c.get('jwtPayload');
        const res = await this.db_conn.addWarehouse({ ...body, orgId: org.orgId });
        return c.json({ ...res }, HttpStatusCodes.CREATED);
    };
    updateWarehouse = async (c) => {
        const body = c.req.valid('json');
        const { id } = c.req.valid('param');
        const org = c.get('jwtPayload');
        const res = await this.db_conn.updateWarehouse({ ...body, orgId: org.orgId }, id);
        return c.json({ ...res }, HttpStatusCodes.OK);
    };
    deleteWarehouse = async (c) => {
        const { id } = c.req.valid('param');
        await this.db_conn.deleteWarehouse(id);
        return c.json({ message: 'Warehouse deleted' }, HttpStatusCodes.OK);
    };
    getWarehouse = async (c) => {
        const org = c.get('jwtPayload');
        const { limit, offset } = c.req.valid('query');
        const res = await this.db_conn.getWarehouse(org.orgId, limit, offset);
        const count = await this.db_conn.getTotalWarehouse();
        if (res.length === 0) {
            return c.json({ message: 'No warehouse found' }, HttpStatusCodes.NOT_FOUND);
        }
        return c.json({ count, result: res }, HttpStatusCodes.OK);
    };
}
