import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Transaction } from "../config/types";
import { db } from "../db/db";
import * as table from "../db/schema";
import { Pool } from "pg";

type DB = NodePgDatabase<Record<string, never>> | Transaction;

export abstract class AbstractModels {
  protected readonly db = db;
  protected readonly table: typeof table = table;

  protected query(tx?: Transaction): DB {
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
    tx?: Transaction,
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
