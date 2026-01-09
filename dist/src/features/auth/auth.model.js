import { AbstractModels } from "@/abstract/abstract.model";
import { eq, and, isNull } from "drizzle-orm";
export class AuthModel extends AbstractModels {
    async createOrganization(name, tx) {
        const org = await this.query(tx)
            .insert(this.table.organization)
            .values({ name })
            .returning()
            .then((rows) => rows[0]);
        return org;
    }
    async getDefaultAdminRole(tx) {
        return await this.query(tx)
            .select()
            .from(this.table.roles)
            .where(and(eq(this.table.roles.isAdmin, true), isNull(this.table.roles.orgId)))
            .limit(1)
            .then((rows) => rows[0]);
    }
    async createAdminUser(body, orgId, roleId, tx) {
        const user = await this.query(tx)
            .insert(this.table.users)
            .values({
            name: body.name,
            email: body.email,
            password: body.password,
            type: "ADMIN",
            orgId,
            roleId,
        })
            .returning()
            .then((rows) => rows[0]);
        return user;
    }
    async checkExistingUser(email, tx) {
        const result = await this.query(tx)
            .select()
            .from(this.table.users)
            .leftJoin(this.table.organization, eq(this.table.users.orgId, this.table.organization.orgId))
            .where(eq(this.table.users.email, email))
            .limit(1)
            .then((rows) => rows[0]);
        return result;
    }
    async insertSession(userID, refreshToken, expiresAt, tx) {
        const result = await this.query(tx).insert(this.table.sessions).values({
            userId: userID,
            refreshToken: refreshToken,
            expiresAt: expiresAt,
        });
        return result;
    }
    async deleteSession(userID, tx) {
        const result = await this.query(tx)
            .delete(this.table.sessions)
            .where(eq(this.table.sessions.userId, userID));
        return result;
    }
    async checkSession(refreshToken) {
        const result = await this.query()
            .select()
            .from(this.table.sessions)
            .where(eq(this.table.sessions.refreshToken, refreshToken))
            .limit(1);
        return result[0];
    }
    async createOTP(userId, code, type, expiresAt, tx) {
        return await this.query(tx)
            .insert(this.table.otpCodes)
            .values({
            userId,
            code,
            type,
            expiresAt,
        })
            .returning()
            .then((rows) => rows[0]);
    }
    async findOTP(userId, code, type, tx) {
        return await this.query(tx)
            .select()
            .from(this.table.otpCodes)
            .where(and(eq(this.table.otpCodes.userId, userId), eq(this.table.otpCodes.code, code), eq(this.table.otpCodes.type, type)))
            .limit(1)
            .then((rows) => rows[0]);
    }
    async deleteOTP(id, tx) {
        return await this.query(tx).delete(this.table.otpCodes).where(eq(this.table.otpCodes.id, id));
    }
    async updatePassword(userId, password, tx) {
        return await this.query(tx)
            .update(this.table.users)
            .set({ password })
            .where(eq(this.table.users.userId, userId));
    }
}
