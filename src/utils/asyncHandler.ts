import type { Context } from 'hono';

export function asyncHandler<C extends Context = Context>(
  fn: (c: C) => Promise<Response | void>
): (c: C) => Promise<Response | void> {
  return async (c: C) => {
    try {
      return await fn(c);
    } catch (err) {
      throw err;
    }
  };
}
