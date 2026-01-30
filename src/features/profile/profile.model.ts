import { and, eq, ne } from "drizzle-orm";
import { AbstractModels } from "../../abstract/abstract.model";
import { Transaction } from "../../config/types";

export class ProfileModel extends AbstractModels {
  async getUserProfile(userId: number, tx?: Transaction) {
    return await this.query(tx)
      .select()
      .from(this.table.users)
      .leftJoin(this.table.organization, eq(this.table.users.orgId, this.table.organization.orgId))
      .leftJoin(this.table.roles, eq(this.table.users.roleId, this.table.roles.roleId))
      .where(eq(this.table.users.userId, userId))
      .limit(1)
      .then((rows) => rows[0]);
  }

  async updateUser(
    userId: number,
    data: { name?: string; email?: string; twoFa?: boolean },
    tx?: Transaction,
  ) {
    return await this.query(tx)
      .update(this.table.users)
      .set(data)
      .where(eq(this.table.users.userId, userId))
      .returning();
  }

  async getUserPassword(userId: number, tx?: Transaction) {
    return await this.query(tx)
      .select({ password: this.table.users.password })
      .from(this.table.users)
      .where(eq(this.table.users.userId, userId))
      .limit(1)
      .then((rows) => rows[0]?.password);
  }

  async updatePassword(userId: number, password: string, tx?: Transaction) {
    return await this.query(tx)
      .update(this.table.users)
      .set({ password })
      .where(eq(this.table.users.userId, userId));
  }

  async getSessions(userId: number, tx?: Transaction) {
    return await this.query(tx)
      .select()
      .from(this.table.sessions)
      .where(eq(this.table.sessions.userId, userId));
  }

  async revokeSession(sessionId: string, userId: number, tx?: Transaction) {
    // using raw string ID for session table 'id' (uuid)
    return await this.query(tx)
      .delete(this.table.sessions)
      .where(and(eq(this.table.sessions.id, sessionId), eq(this.table.sessions.userId, userId)));
  }

  async revokeAllSessions(userId: number, currentSessionId?: string, tx?: Transaction) {
    // Optional: Keep current session? The user request says "revokeAllSessions".
    // Usually means all OTHER sessions or REALLY all.
    // If really all, the user will be logged out immediately.
    // If I have currentSessionId (from cookie/token), I might want to exclude it if "revoke OTHER sessions" is intended.
    // But "revokeAllSessions" usually means ALL.
    // Let's assume ALL for now.
    return await this.query(tx)
      .delete(this.table.sessions)
      .where(eq(this.table.sessions.userId, userId));
  }
}
