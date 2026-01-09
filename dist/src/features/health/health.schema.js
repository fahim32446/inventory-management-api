import { IHealthLog } from '@/db/schema.type';
import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
export class HealthSchema {
    createHealth = createRoute({
        path: '/',
        method: 'post',
        tags: ['health'],
        security: [
            {
                bearerAuth: [],
            },
        ],
        request: {},
        responses: {
            [HttpStatusCodes.OK]: jsonContent(IHealthLog, 'Insert to db for test purpose'),
        },
    });
}
const instance = new HealthSchema();
