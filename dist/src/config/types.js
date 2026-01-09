import { z, } from '@hono/zod-openapi';
export const idParams = z.object({
    id: z.preprocess((val) => (typeof val === 'string' ? Number(val) : val), z.number().int().positive()),
});
