import { idParams } from '@/config/types';
import { ZSupplier } from '@/db/schema.type';
import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
export const ZUpdateSupplier = ZSupplier.partial();
export class SupplierSchema {
    addSupplier = createRoute({
        path: '/',
        method: 'post',
        tags: ['supplier'],
        security: [
            {
                bearerAuth: [],
            },
        ],
        request: { body: jsonContentRequired(ZSupplier, 'create supplier') },
        responses: {
            [HttpStatusCodes.CREATED]: jsonContent(ZSupplier, 'Supplier created response'),
        },
    });
    getSupplier = createRoute({
        path: '/',
        method: 'get',
        tags: ['supplier'],
        security: [
            {
                bearerAuth: [],
            },
        ],
        request: {
            query: z.object({
                limit: z
                    .string()
                    .default('10')
                    .transform((val) => (val ? parseInt(val) : 10)),
                offset: z
                    .string()
                    .default('0')
                    .transform((val) => (val ? parseInt(val) : 0)),
            }),
        },
        responses: {
            [HttpStatusCodes.OK]: jsonContent(z.object({
                count: z.number(),
                result: z.array(ZSupplier),
            }), 'Supplier fetched'),
            [HttpStatusCodes.NOT_FOUND]: jsonContent(z.object({
                message: z.string(),
            }), 'No supplier found'),
        },
    });
    updateSupplier = createRoute({
        path: '/:id',
        method: 'put',
        tags: ['supplier'],
        security: [
            {
                bearerAuth: [],
            },
        ],
        request: {
            params: idParams,
            body: jsonContentRequired(ZUpdateSupplier, 'Update supplier'),
        },
        responses: {
            [HttpStatusCodes.OK]: jsonContent(ZSupplier, 'Supplier updated'),
        },
    });
    deleteSupplier = createRoute({
        path: '/:id',
        method: 'delete',
        tags: ['supplier'],
        security: [
            {
                bearerAuth: [],
            },
        ],
        request: { params: idParams },
        responses: {
            [HttpStatusCodes.OK]: jsonContent(z.object({
                message: z.string(),
            }), 'Supplier deleted'),
        },
    });
}
const instance = new SupplierSchema();
