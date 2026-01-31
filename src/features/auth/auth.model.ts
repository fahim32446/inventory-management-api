import { and, eq, isNull } from "drizzle-orm";
import { AbstractModels } from "../../abstract/abstract.model";
import { Transaction } from "../../config/types";
import { IUserCreateType } from "../../db/schema.type";

export class AuthModel extends AbstractModels {
  async createOrganization(name: string, tx?: Transaction) {
    const org = this.query(tx)
      .insert(this.table.organization)
      .values({ name })
      .returning()
      .then((rows) => rows[0]);

    return org;
  }

  async getDefaultAdminRole(tx?: Transaction) {
    return await this.query(tx)
      .select()
      .from(this.table.roles)
      .where(and(eq(this.table.roles.isAdmin, true), isNull(this.table.roles.orgId)))
      .limit(1)
      .then((rows) => rows[0]);
  }

  async createAdminUser(body: IUserCreateType, orgId: number, roleId: number, tx?: Transaction) {
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

  async checkExistingUser(email: string, tx?: Transaction) {
    const result = await this.query(tx)
      .select()
      .from(this.table.users)
      .leftJoin(this.table.organization, eq(this.table.users.orgId, this.table.organization.orgId))
      .leftJoin(this.table.roles, eq(this.table.users.roleId, this.table.roles.roleId))
      .where(eq(this.table.users.email, email))
      .limit(1)
      .then((rows) => rows[0]);

    return result;
  }

  async getPermissions(userId: number, tx?: Transaction): Promise<string[]> {
    const rows = await this.query(tx)
      .select({
        permission: this.table.permissions.key,
      })
      .from(this.table.users)
      .where(eq(this.table.users.userId, userId))
      .leftJoin(
        this.table.rolePermissions,
        eq(this.table.users.roleId, this.table.rolePermissions.roleId),
      )
      .leftJoin(
        this.table.permissions,
        eq(this.table.rolePermissions.permissionId, this.table.permissions.permissionId),
      );

    return rows.map((r) => r.permission).filter((p): p is string => !!p);
  }

  async checkUserById(id: number, tx?: Transaction) {
    const result = await this.query(tx)
      .select()
      .from(this.table.users)
      .leftJoin(this.table.organization, eq(this.table.users.orgId, this.table.organization.orgId))
      .leftJoin(this.table.roles, eq(this.table.users.roleId, this.table.roles.roleId))
      .where(eq(this.table.users.userId, id))
      .limit(1)
      .then((rows) => rows[0]);

    return result;
  }

  async insertSession(
    userID: number,
    refreshToken: any,
    expiresAt: Date,
    sessionInfo?: {
      userAgent?: string;
      ipAddress?: string;
      location?: string;
      device?: string;
    },
    tx?: Transaction,
  ) {
    const result = await this.query(tx).insert(this.table.sessions).values({
      userId: userID,
      refreshToken: refreshToken,
      expiresAt: expiresAt,
      userAgent: sessionInfo?.userAgent,
      ipAddress: sessionInfo?.ipAddress,
      location: sessionInfo?.location,
      device: sessionInfo?.device,
    });

    return result;
  }
  async deleteSession(userID: number, tx?: Transaction) {
    const result = await this.query(tx)
      .delete(this.table.sessions)
      .where(eq(this.table.sessions.userId, userID));

    return result;
  }
  async checkSession(refreshToken: string) {
    const result = await this.query()
      .select()
      .from(this.table.sessions)
      .where(eq(this.table.sessions.refreshToken, refreshToken))
      .limit(1);

    return result[0];
  }

  async createOTP(userId: number, code: string, type: string, expiresAt: Date, tx?: Transaction) {
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

  async findOTP(userId: number, code: string, type: string, tx?: Transaction) {
    return await this.query(tx)
      .select()
      .from(this.table.otpCodes)
      .where(
        and(
          eq(this.table.otpCodes.userId, userId),
          eq(this.table.otpCodes.code, code),
          eq(this.table.otpCodes.type, type),
        ),
      )
      .limit(1)
      .then((rows) => rows[0]);
  }

  async deleteOTP(id: number, tx?: Transaction) {
    return await this.query(tx).delete(this.table.otpCodes).where(eq(this.table.otpCodes.id, id));
  }

  async updatePassword(userId: number, password: string, tx?: Transaction) {
    return await this.query(tx)
      .update(this.table.users)
      .set({ password })
      .where(eq(this.table.users.userId, userId));
  }
}
