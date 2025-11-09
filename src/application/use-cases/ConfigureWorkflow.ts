import { AuditTrail } from "../../domain/entities/AuditTrail"
import { UserId } from "../../domain/value-objects/UserId"
import { AreaId } from "../../domain/value-objects/AreaId"
import type { AreaRepository } from "../ports/AreaRepository"
import type { AuditRepository } from "../ports/AuditRepository"
import type { Clock } from "../ports/Clock"
import type { WorkflowConfig } from "../dtos/area"

export class ConfigureWorkflow {
    constructor(
        private readonly areaRepository: AreaRepository,
        private readonly auditRepository: AuditRepository,
        private readonly clock: Clock
    ) { }

    async execute(
        areaId: string,
        config: WorkflowConfig,
        actorId: string
    ): Promise<void> {
        const area = await this.areaRepository.findById(areaId)

        if (!area) {
            throw new Error("Area not found")
        }

        const oldConfig = area.workflowConfig
        area.setWorkflow(config)

        await this.areaRepository.save(area)

        const audit = AuditTrail.create(
            {
                actorId: UserId.from(actorId),
                action: "WORKFLOW_UPDATED",
                entityType: "Area",
                entityId: area.id.toString(),
                changes: { workflow: { from: oldConfig, to: config } },
            },
            this.clock.now()
        )

        await this.auditRepository.save(audit)
    }
}
