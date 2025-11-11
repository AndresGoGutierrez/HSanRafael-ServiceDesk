import type { SLARepository } from "../ports/SLARepository"
import type { AreaRepository } from "../ports/AreaRepository"
import type { AuditRepository } from "../ports/AuditRepository"
import type { Clock } from "../ports/Clock"
import type { EventBus } from "../ports/EventBus"

import { SLA } from "../../domain/entities/SLA"
import { AuditTrail } from "../../domain/entities/AuditTrail"
import { UserId } from "../../domain/value-objects/UserId"
import { CreateSLASchema, type CreateSLADto } from "../dtos/sla"

/**
 * Caso de uso: Configurar o actualizar el SLA asociado a un área.
 *
 * Responsabilidades:
 * - Validar la entrada con Zod.
 * - Verificar la existencia del área.
 * - Crear o actualizar el SLA.
 * - Registrar auditoría de cambios.
 * - Publicar eventos de dominio relevantes.
 *
 * Patrón: Application Service (Clean Architecture)
 */
export class ConfigureSLAUseCase {
    constructor(
        private readonly slaRepository: SLARepository,
        private readonly areaRepository: AreaRepository,
        private readonly auditRepository: AuditRepository,
        private readonly clock: Clock,
        private readonly eventBus: EventBus,
    ) { }

    /**
     * Ejecuta la operación de configuración del SLA.
     * @param areaId ID del área objetivo.
     * @param input Datos de configuración del SLA.
     * @param actorId ID del usuario que ejecuta la acción.
     * @returns El SLA creado o actualizado.
     * @throws Error si el área no existe o la validación falla.
     */
    async execute(areaId: string, input: CreateSLADto, actorId: string): Promise<SLA> {
        const validatedInput = CreateSLASchema.parse(input)
        const now = this.clock.now()

        // 🧩 1. Verificar existencia del área
        const area = await this.areaRepository.findById(areaId)
        if (!area) {
            throw new Error(`Area with ID "${areaId}" not found.`)
        }

        // 🧩 2. Verificar si ya existe un SLA asociado
        const existingSLA = await this.slaRepository.findByAreaId(areaId)

        let sla: SLA
        let auditAction: "SLA_CREATED" | "SLA_UPDATED"

        if (existingSLA) {
            // 🧠 Actualizar SLA existente
            const { responseTimeMinutes: oldResponse, resolutionTimeMinutes: oldResolution } = existingSLA

            existingSLA.update(
                validatedInput.responseTimeMinutes,
                validatedInput.resolutionTimeMinutes,
                now,
            )

            await this.slaRepository.save(existingSLA)
            sla = existingSLA
            auditAction = "SLA_UPDATED"

            await this.recordAuditTrail(actorId, auditAction, sla, now, {
                responseTimeMinutes: { from: oldResponse, to: validatedInput.responseTimeMinutes },
                resolutionTimeMinutes: { from: oldResolution, to: validatedInput.resolutionTimeMinutes },
            })
        } else {
            // 🧠 Crear nuevo SLA
            sla = SLA.create(
                {
                    areaId,
                    responseTimeMinutes: validatedInput.responseTimeMinutes,
                    resolutionTimeMinutes: validatedInput.resolutionTimeMinutes,
                },
                now,
            )

            await this.slaRepository.save(sla)
            auditAction = "SLA_CREATED"

            await this.recordAuditTrail(actorId, auditAction, sla, now, {
                responseTimeMinutes: validatedInput.responseTimeMinutes,
                resolutionTimeMinutes: validatedInput.resolutionTimeMinutes,
            })
        }

        // 🧩 3. Publicar eventos de dominio
        await this.eventBus.publishAll(sla.pullDomainEvents())

        return sla
    }

    /**
     * Registra un cambio en el AuditTrail.
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
        )

        await this.auditRepository.save(audit)
    }
}
