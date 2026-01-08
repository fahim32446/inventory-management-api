import type { ErrorHandler } from 'hono';

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('Global Error:', err);
  return c.json({ error: err.message }, 500);
};
