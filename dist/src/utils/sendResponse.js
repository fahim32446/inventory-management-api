export const sendResponse = (c, data, status = 200) => {
    return c.json({ success: true, data }, status);
};
