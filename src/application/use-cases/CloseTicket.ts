import type { TicketRepository } from "../ports/TicketRepository"
import type { AuditRepository } from "../ports/AuditRepository"
import type { EventBus } from "../ports/EventBus"
import type { Clock } from "../ports/Clock"
import { TicketId } from "../../domain/value-objects/TicketId"
import type { TicketStatus } from "../../domain/value-objects/Status"
import { UserId } from "../../domain/value-objects/UserId"
import { AuditTrail } from "../../domain/entities/AuditTrail"

/**
 * Datos requeridos para cerrar un ticket
 */
export interface CloseTicketInput {
    ticketId: string
    resolutionSummary: string
    notifyRequester: boolean
    actorId: string
}

/**
 * Caso de uso: Cierra un ticket en el sistema
 *
 * Este caso de uso orquesta la lógica de negocio de cerrar un ticket:
 * - Verifica existencia y estado.
 * - Marca el ticket como resuelto y luego cerrado.
 * - Persiste cambios y registra auditoría.
 * - Emite un evento de dominio si se debe notificar.
 */
export class CloseTicket {
    constructor(
        private readonly ticketRepository: TicketRepository,
        private readonly auditRepository: AuditRepository,
        private readonly eventBus: EventBus,
        private readonly clock: Clock,
    ) { }

    async execute(input: CloseTicketInput): Promise<void> {
        const ticketId = TicketId.from(input.ticketId)
        const now = this.clock.now()

        const ticket = await this.ticketRepository.findById(ticketId)
        if (!ticket) {
            throw new Error("Ticket no encontrado")
        }

        // Verificar estado actual
        if (ticket.status === "CLOSED") {
            throw new Error("El ticket ya está cerrado.")
        }

        // Si aún no está resuelto, primero se marca como resuelto
        if (ticket.status !== "RESOLVED") {
            ticket.transition("RESOLVED" as TicketStatus, now)
        }

        // Cerrar el ticket con su resumen
        ticket.resolutionSummary = input.resolutionSummary
        ticket.transition("CLOSED" as TicketStatus, now)

        await this.ticketRepository.save(ticket)

        // Registrar auditoría
        const audit = AuditTrail.create(
            {
                actorId: UserId.from(input.actorId),
                action: "CLOSE",
                entityType: "Ticket",
                entityId: ticketId.toString(),
                changes: {
                    status: { from: "RESOLVED", to: "CLOSED" },
                    resolutionSummary: input.resolutionSummary,
                },
            },
            now // ✅ este `now` se pasa al constructor como `createdAt`
        )

        await this.auditRepository.save(audit)

        // Publicar evento para notificación al solicitante
        if (input.notifyRequester && ticket.requesterId) {
            await this.eventBus.publish({
                type: "ticket.closed",
                occurredAt: now,
                payload: {
                    ticketId: ticketId.toString(),
                    requesterId: ticket.requesterId.toString(),
                    resolutionSummary: input.resolutionSummary,
                },
            })
        }
    }
}
