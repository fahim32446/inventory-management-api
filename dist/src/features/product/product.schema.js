import { idParams } from '@/config/types';
import { ZProduct } from '@/db/schema.type';
import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
export const ZUpdateProduct = ZProduct.partial();
export class ProductSchema {
    addProduct = createRoute({
        path: '/',
        method: 'post',
        tags: ['product'],
        security: [
            {
                bearerAuth: [],
            },
        ],
        request: { body: jsonContentRequired(ZProduct, 'create product') },
        responses: {
            [HttpStatusCodes.CREATED]: jsonContent(ZProduct, 'Product created response'),
        },
    });
    getProduct = createRoute({
        path: '/',
        method: 'get',
        tags: ['product'],
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
                result: z.array(ZProduct),
            }), 'Product fetched'),
            [HttpStatusCodes.NOT_FOUND]: jsonContent(z.object({
                message: z.string(),
            }), 'No product found'),
        },
    });
    updateProduct = createRoute({
        path: '/:id',
        method: 'put',
        tags: ['product'],
        security: [
            {
                bearerAuth: [],
            },
        ],
        request: {
            params: idParams,
            body: jsonContentRequired(ZUpdateProduct, 'Update product'),
        },
        responses: {
            [HttpStatusCodes.OK]: jsonContent(ZProduct, 'Product updated'),
        },
    });
    deleteProduct = createRoute({
        path: '/:id',
        method: 'delete',
        tags: ['product'],
        security: [
            {
                bearerAuth: [],
            },
        ],
        request: { params: idParams },
        responses: {
            [HttpStatusCodes.OK]: jsonContent(z.object({
                message: z.string(),
            }), 'Product deleted'),
        },
    });
}
const instance = new ProductSchema();
