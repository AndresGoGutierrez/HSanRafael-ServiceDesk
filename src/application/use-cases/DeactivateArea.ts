import { AreaId } from "../../domain/value-objects/AreaId"
import { UserId } from "../../domain/value-objects/UserId"
import { AuditTrail } from "../../domain/entities/AuditTrail"

import type { AreaRepository } from "../ports/AreaRepository"
import type { TicketRepository } from "../ports/TicketRepository"
import type { AuditRepository } from "../ports/AuditRepository"
import type { Clock } from "../ports/Clock"

/**
 * Use case: Deactivate an area of the system.
 *
 * Business rules:
 * - An area with active tickets cannot be deactivated.
 * - An audit event is recorded.
 * - The action is executed from the domain (the status is not changed directly).
 */
export class DeactivateArea {
    constructor(
        private readonly areaRepository: AreaRepository,
        private readonly ticketRepository: TicketRepository,
        private readonly auditRepository: AuditRepository,
        private readonly clock: Clock,
    ) { }

    /**
     * Deactivates the specified area.
     *
     * @param areaId - Unique identifier of the area to be deactivated.
     * @param actorId - Identifier of the user performing the action.
     * @param reason - Optional reason for deactivation.
     */
    async execute(areaId: string, actorId: string, reason?: string): Promise<void> {
        const areaIdVO = AreaId.from(areaId)
        const actorIdVO = UserId.from(actorId)

        const area = await this.areaRepository.findById(areaIdVO.toString())
        if (!area) {
            throw new Error("Area not found")
        }

        const activeTickets = await this.ticketRepository.countByAreaAndStatus(
            areaIdVO.toString(),
            ["OPEN", "IN_PROGRESS", "PENDING"],
        )

        if (activeTickets > 0) {
            throw new Error(
                `Cannot deactivate area with ${activeTickets} active tickets. Please resolve or reassign them first.`,
            )
        }

        // Disable from the domain
        area.deactivate(this.clock.now())
        await this.areaRepository.save(area)

        // Log audit event
        const audit = AuditTrail.create(
            {
                actorId: actorIdVO,
                action: "DEACTIVATE",
                entityType: "Area",
                entityId: areaIdVO.toString(),
                changes: { isActive: { from: true, to: false }, reason },
            },
            this.clock.now(),
        )

        await this.auditRepository.save(audit)
    }
}
