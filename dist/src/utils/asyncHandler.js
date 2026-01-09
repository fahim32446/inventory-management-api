export function asyncHandler(fn) {
    return async (c) => {
        try {
            return await fn(c);
        }
        catch (err) {
            throw err;
        }
    };
}
