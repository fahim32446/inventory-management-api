import type { Transaction } from "@/config/types";
import { db } from "@/db/db";
import * as table from "@/db/schema";

export abstract class AbstractModels {
  protected readonly db = db;
  protected readonly table: typeof table = table;

  protected query(tx?: Transaction) {
    return tx ?? this.db;
  }

  async logAudit(
    data: {
      userId?: number;
      orgId?: number;
      action: string;
      details?: string;
      ip?: string;
      location?: string;
      browser?: string;
      device?: string;
      os?: string;
    },
    tx?: Transaction
  ) {
    return await this.query(tx).insert(this.table.auditLog).values({
      userId: data.userId,
      orgId: data.orgId,
      action: data.action,
      details: data.details,
      ip: data.ip,
      location: data.location,
      browser: data.browser,
      device: data.device,
      os: data.os,
    });
  }
}
