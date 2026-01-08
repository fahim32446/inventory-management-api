import type { AppRouteHandler } from '@/config/types';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { HealthModel } from './health.model';
import type { ICreateHealth } from './health.schema';

export class HealthService {
  private db = new HealthModel();

  public healthCheck: AppRouteHandler<ICreateHealth> = async (c) => {
    const auth = c.get('jwtPayload');

    const result = await this.db.insertHealthLogDB();
    return c.json(result, HttpStatusCodes.OK);
  };
}
