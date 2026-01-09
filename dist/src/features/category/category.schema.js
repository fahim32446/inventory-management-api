import { idParams } from '@/config/types';
import { ZCategory } from '@/db/schema.type';
import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
export const ZUpdateCategory = ZCategory.partial();
export class CategorySchema {
    addCategory = createRoute({
        path: '/',
        method: 'post',
        tags: ['category'],
        security: [
            {
                bearerAuth: [],
            },
        ],
        request: { body: jsonContentRequired(ZCategory, 'create category') },
        responses: {
            [HttpStatusCodes.CREATED]: jsonContent(ZCategory, 'Category created response'),
        },
    });
    getCategory = createRoute({
        path: '/',
        method: 'get',
        tags: ['category'],
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
                result: z.array(ZCategory),
            }), 'Category fetched'),
            [HttpStatusCodes.NOT_FOUND]: jsonContent(z.object({
                message: z.string(),
            }), 'No category found'),
        },
    });
    updateCategory = createRoute({
        path: '/:id',
        method: 'put',
        tags: ['category'],
        security: [
            {
                bearerAuth: [],
            },
        ],
        request: {
            params: idParams,
            body: jsonContentRequired(ZUpdateCategory, 'Update category'),
        },
        responses: {
            [HttpStatusCodes.OK]: jsonContent(ZCategory, 'Category updated'),
        },
    });
    deleteCategory = createRoute({
        path: '/:id',
        method: 'delete',
        tags: ['category'],
        security: [
            {
                bearerAuth: [],
            },
        ],
        request: { params: idParams },
        responses: {
            [HttpStatusCodes.OK]: jsonContent(z.object({
                message: z.string(),
            }), 'Category deleted'),
        },
    });
}
const instance = new CategorySchema();
