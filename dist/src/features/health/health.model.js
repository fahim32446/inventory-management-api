import { AbstractModels } from '@/abstract/abstract.model';
export class HealthModel extends AbstractModels {
    async insertHealthLogDB() {
        const [row] = await this.query().insert(this.table.healthLogs).values({}).returning();
        return row;
    }
}
