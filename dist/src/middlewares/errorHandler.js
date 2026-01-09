export const errorHandler = (err, c) => {
    console.error('Global Error:', err);
    return c.json({ error: err.message }, 500);
};
