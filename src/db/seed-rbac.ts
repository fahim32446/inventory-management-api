import { eq, and, inArray } from "drizzle-orm";
import { db } from "./db";
import { permissions, rolePermissions, roles } from "./schema";

/* ----------------------------------
   Permission list (source of truth)
----------------------------------- */
const PERMISSIONS = [
  "sale:create",
  "sale:read",
  "sale:update",
  "sale:delete",
  "dashboard:read",
  "products:create",
  "products:read",
  "products:update",
  "products:delete",
  "category:create",
  "category:read",
  "category:update",
  "category:delete",
  "warehouse:create",
  "warehouse:read",
  "warehouse:update",
  "warehouse:delete",
  "suppliers:create",
  "suppliers:read",
  "suppliers:update",
  "suppliers:delete",
  "purchase:create",
  "purchase:read",
  "purchase:update",
  "purchase:delete",
  "report:read",
  "administration:read",
  "administration:update",
  "administration:users:create",
  "administration:users:read",
  "administration:users:update",
  "administration:users:delete",
  "administration:roles:create",
  "administration:roles:read",
  "administration:roles:update",
  "administration:roles:delete",
] as const;

/* ----------------------------------
   Seeder
----------------------------------- */
export async function seedRBAC() {
  /* ---------- 1. Ensure permissions ---------- */
  const existingPermissions = await db.select({ key: permissions.key }).from(permissions);

  const existingKeys = new Set(existingPermissions.map((p) => p.key));

  const missingPermissions = PERMISSIONS.filter((key) => !existingKeys.has(key));

  if (missingPermissions.length > 0) {
    await db.insert(permissions).values(missingPermissions.map((key) => ({ key })));
  }

  /* ---------- 2. Ensure Admin role ---------- */
  let adminRole = await db
    .select()
    .from(roles)
    //@ts-ignore
    .where(and(eq(roles.name, "Admin"), eq(roles.isAdmin, true), eq(roles.orgId, null)));

  if (adminRole.length === 0) {
    const [created] = await db
      .insert(roles)
      .values({
        name: "Admin",
        orgId: null,
        isAdmin: true,
      })
      .returning();

    adminRole = [created];
  }

  const roleId = adminRole[0].roleId;

  /* ---------- 3. Fetch all permission IDs ---------- */
  const allPermissions = await db
    .select({
      permissionId: permissions.permissionId,
    })
    .from(permissions);

  /* ---------- 4. Find already assigned permissions ---------- */
  const assigned = await db
    .select({
      permissionId: rolePermissions.permissionId,
    })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId));

  const assignedIds = new Set(assigned.map((a) => a.permissionId));

  /* ---------- 5. Assign only missing permissions ---------- */
  const missingRolePermissions = allPermissions.filter((p) => !assignedIds.has(p.permissionId));

  if (missingRolePermissions.length > 0) {
    await db.insert(rolePermissions).values(
      missingRolePermissions.map((p) => ({
        roleId,
        permissionId: p.permissionId,
      }))
    );
  }

  console.log("✅ RBAC seeding completed safely");
}
