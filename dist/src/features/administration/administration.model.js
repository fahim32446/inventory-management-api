import { AbstractModels } from "@/abstract/abstract.model";
import { and, eq, isNull, or } from "drizzle-orm";
export class administrationModel extends AbstractModels {
    async getPermission() {
        const res = await this.query().select().from(this.table.permissions);
        return res;
    }
    async createRole(body) {
        const role = await this.db.transaction(async (tx) => {
            const [role] = await tx
                .insert(this.table.roles)
                .values({ name: body.name, orgId: body.orgId, isAdmin: body.isAdmin })
                .returning();
            const rolePermissionValues = body?.permissionId?.map((permissionId) => ({
                roleId: role.roleId,
                permissionId,
            }));
            if (rolePermissionValues.length > 0) {
                await tx.insert(this.table.rolePermissions).values(rolePermissionValues);
            }
            return { roleName: body.name, rolePermissionValues };
        });
        return role;
    }
    async roleIsAdmin(roleId) {
        const [res] = await this.query()
            .select()
            .from(this.table.roles)
            .where(eq(this.table.roles.roleId, roleId));
        return res;
    }
    async updateRole(body, roleId) {
        const res = await this.db.transaction(async (tx) => {
            await tx
                .update(this.table.roles)
                .set({
                name: body.name,
                isAdmin: body.isAdmin,
            })
                .where(eq(this.table.roles.roleId, roleId));
            await tx
                .delete(this.table.rolePermissions)
                .where(eq(this.table.rolePermissions.roleId, roleId));
            if (body.permissionId?.length) {
                const rolePermissionValues = body.permissionId.map((permissionId) => ({
                    roleId,
                    permissionId,
                }));
                await tx.insert(this.table.rolePermissions).values(rolePermissionValues);
            }
            return {
                roleId,
                roleName: body.name,
                permissions: body.permissionId ?? [],
            };
        });
        return res;
    }
    async getRoleDetails(id) {
        const result = await this.query().transaction(async (tx) => {
            const rows = await tx
                .select()
                .from(this.table.roles)
                .leftJoin(this.table.rolePermissions, eq(this.table.roles.roleId, this.table.rolePermissions.roleId))
                .leftJoin(this.table.permissions, eq(this.table.rolePermissions.permissionId, this.table.permissions.permissionId))
                .where(eq(this.table.roles.roleId, Number(id)));
            if (!rows.length) {
                return null;
            }
            const { roles } = rows[0];
            const permissions = rows
                .filter((r) => r.permissions !== null)
                .map((r) => ({
                permissionId: r.permissions.permissionId,
                key: r.permissions.key,
            }));
            return {
                roleId: roles.roleId,
                name: roles.name,
                permissions,
            };
        });
        return result;
    }
    async getRoles(orgId) {
        const result = await this.query()
            .select({
            roleId: this.table.roles.roleId,
            name: this.table.roles.name,
            isAdmin: this.table.roles.isAdmin,
        })
            .from(this.table.roles)
            .where(or(eq(this.table.roles.orgId, orgId), isNull(this.table.roles.orgId)));
        return result;
    }
    async createUser(body, orgId) {
        const user = await this.query()
            .insert(this.table.users)
            .values({
            name: body.name,
            email: body.email,
            password: body.password,
            type: "EMPLOYEE",
            roleId: body.roleId,
            orgId,
        })
            .returning()
            .then((rows) => rows[0]);
        return user;
    }
    async getUsers(orgId) {
        const result = await this.query()
            .select({
            userId: this.table.users.userId,
            name: this.table.users.name,
            email: this.table.users.email,
            type: this.table.users.type,
            roleId: this.table.users.roleId,
            roleName: this.table.roles.name,
        })
            .from(this.table.users)
            .leftJoin(this.table.roles, eq(this.table.users.roleId, this.table.roles.roleId))
            .where(eq(this.table.users.orgId, orgId));
        return result;
    }
    async updateUser(body, orgId, id) {
        const user = await this.query()
            .update(this.table.users)
            .set(body)
            .where(and(eq(this.table.users.userId, id), eq(this.table.users.orgId, orgId)))
            .returning()
            .then((rows) => rows[0]);
        return user;
    }
    async deleteUser(orgId, id) {
        const user = await this.query()
            .delete(this.table.users)
            .where(eq(this.table.users.userId, id) && eq(this.table.users.orgId, orgId))
            .returning()
            .then((rows) => rows[0]);
        return user;
    }
}
