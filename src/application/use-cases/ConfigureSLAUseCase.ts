import type { SLARepository } from "../ports/SLARepository";
import type { AreaRepository } from "../ports/AreaRepository";
import type { AuditRepository } from "../ports/AuditRepository";
import type { Clock } from "../ports/Clock";
import type { EventBus } from "../ports/EventBus";

import { SLA } from "../../domain/entities/SLA";
import { AuditTrail } from "../../domain/entities/AuditTrail";
import { UserId } from "../../domain/value-objects/UserId";
import { CreateSLASchema, type CreateSLADto } from "../dtos/sla";

/**
 * Use case: Configure or update the SLA associated with an area.
 *
 * Responsibilities:
 * - Validate the entry with Zod.
 * - Verify the existence of the area.
 * - Create or update the SLA.
 * - Record audit of changes.
 * - Publish relevant domain events.
 *
 * Pattern: Application Service (Clean Architecture)
 */
export class ConfigureSLAUseCase {
    constructor(
        private readonly slaRepository: SLARepository,
        private readonly areaRepository: AreaRepository,
        private readonly auditRepository: AuditRepository,
        private readonly clock: Clock,
        private readonly eventBus: EventBus,
    ) {}

    /**
     * Executes the SLA configuration operation.
     * @param areaId ID of the target area.
     * @param input SLA configuration data.
     * @param actorId ID of the user executing the action.
     * @returns The created or updated SLA.
     * @throws Error if the area does not exist or validation fails.
     */
    async execute(areaId: string, input: CreateSLADto, actorId: string): Promise<SLA> {
        const validatedInput = CreateSLASchema.parse(input);
        const now = this.clock.now();

        // Verify existence of the area
        const area = await this.areaRepository.findById(areaId)
        if (!area) {
            throw new Error(`Area with ID "${areaId}" not found.`);
        }

        // Check if an SLA is already associated
        const existingSLA = await this.slaRepository.findByAreaId(areaId)

        let sla: SLA;
        let auditAction: "SLA_CREATED" | "SLA_UPDATED";

        if (existingSLA) {
            const { responseTimeMinutes: oldResponse, resolutionTimeMinutes: oldResolution } = existingSLA

            existingSLA.update(
                validatedInput.responseTimeMinutes,
                validatedInput.resolutionTimeMinutes,
                now,
            );

            await this.slaRepository.save(existingSLA);
            sla = existingSLA;
            auditAction = "SLA_UPDATED";

            await this.recordAuditTrail(actorId, auditAction, sla, now, {
                responseTimeMinutes: { from: oldResponse, to: validatedInput.responseTimeMinutes },
                resolutionTimeMinutes: {
                    from: oldResolution,
                    to: validatedInput.resolutionTimeMinutes,
                },
            });
        } else {
            sla = SLA.create(
                {
                    areaId,
                    responseTimeMinutes: validatedInput.responseTimeMinutes,
                    resolutionTimeMinutes: validatedInput.resolutionTimeMinutes,
                },
                now,
            );

            await this.slaRepository.save(sla);
            auditAction = "SLA_CREATED";

            await this.recordAuditTrail(actorId, auditAction, sla, now, {
                responseTimeMinutes: validatedInput.responseTimeMinutes,
                resolutionTimeMinutes: validatedInput.resolutionTimeMinutes,
            });
        }

        // Publish domain events
        await this.eventBus.publishAll(sla.pullDomainEvents())

        return sla;
    }

    /**
     * Records a change in the AuditTrail.
     */
    private async recordAuditTrail(
        actorId: string,
        action: string,
        sla: SLA,
        timestamp: Date,
        changes: Record<string, any>,
    ): Promise<void> {
        const audit = AuditTrail.create(
            {
                actorId: UserId.from(actorId),
                action,
                entityType: "SLA",
                entityId: sla.id.toString(),
                changes,
            },
            timestamp,
        );

        await this.auditRepository.save(audit);
    }
}
