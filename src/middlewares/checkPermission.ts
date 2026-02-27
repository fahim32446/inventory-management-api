import { eq } from "drizzle-orm";
import { Context, Next } from "hono";
import { PERMISSION_TYPE } from "../config/types";
import { db } from "../db/db";
import { permissions, rolePermissions, roles, users } from "../db/schema";

export const checkPermission = (requiredPermission: PERMISSION_TYPE) => {
  return async (c: Context, next: Next) => {
    const payload = c.get("jwtPayload");

    if (!payload) {
      return c.json({ message: "Unauthorized: Missing user context" }, 401);
    }

    const { userId } = payload;

    // Fetch user and check permissions
    const userRole = await db
      .select({
        isAdmin: roles.isAdmin,
        permissionKey: permissions.key,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.roleId))
      .leftJoin(rolePermissions, eq(roles.roleId, rolePermissions.roleId))
      .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.permissionId))
      .where(eq(users.userId, userId));

    if (userRole.length === 0) {
      return c.json({ message: "Forbidden: User has no role or permissions" }, 403);
    }

    // Check if user is Admin or has the required permission
    const hasPermission = userRole.some((r) => r.isAdmin || r.permissionKey === requiredPermission);

    if (!hasPermission) {
      return c.json({ message: `Forbidden: Missing permission '${requiredPermission}'` }, 403);
    }

    return await next();
  };
};
