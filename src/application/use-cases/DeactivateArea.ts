import { AreaId } from "../../domain/value-objects/AreaId"
import { UserId } from "../../domain/value-objects/UserId"
import { AuditTrail } from "../../domain/entities/AuditTrail"

import type { AreaRepository } from "../ports/AreaRepository"
import type { TicketRepository } from "../ports/TicketRepository"
import type { AuditRepository } from "../ports/AuditRepository"
import type { Clock } from "../ports/Clock"

/**
 * Caso de uso: Desactivar un área del sistema.
 *
 * Reglas de negocio:
 * - No se puede desactivar un área con tickets activos.
 * - Se registra un evento de auditoría.
 * - La acción se ejecuta desde el dominio (no se muta el estado directamente).
 */
export class DeactivateArea {
    constructor(
        private readonly areaRepository: AreaRepository,
        private readonly ticketRepository: TicketRepository,
        private readonly auditRepository: AuditRepository,
        private readonly clock: Clock,
    ) { }

    /**
     * Ejecuta la desactivación del área especificada.
     *
     * @param areaId - Identificador único del área a desactivar.
     * @param actorId - Identificador del usuario que realiza la acción.
     * @param reason - Motivo opcional de la desactivación.
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

        // Desactivar desde el dominio
        area.deactivate(this.clock.now())
        await this.areaRepository.save(area)

        // Registrar evento de auditoría
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
