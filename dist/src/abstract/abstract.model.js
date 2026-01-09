import { db } from "@/db/db";
import * as table from "@/db/schema";
export class AbstractModels {
    db = db;
    table = table;
    query(tx) {
        return tx ?? this.db;
    }
    async logAudit(data, tx) {
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
