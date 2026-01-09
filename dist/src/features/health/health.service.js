import * as HttpStatusCodes from 'stoker/http-status-codes';
import { HealthModel } from './health.model';
export class HealthService {
    db = new HealthModel();
    healthCheck = async (c) => {
        const auth = c.get('jwtPayload');
        const result = await this.db.insertHealthLogDB();
        return c.json(result, HttpStatusCodes.OK);
    };
}
