export const sendResponse = (c: any, data: any, status = 200) => {
  return c.json({ success: true, data }, status);
};
