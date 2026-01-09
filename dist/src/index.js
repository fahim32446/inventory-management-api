import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
const app = new Hono();
app.get('/', (c) => {
    return c.text('Hello Hono aws lambda!');
});
export const handler = handle(app);
