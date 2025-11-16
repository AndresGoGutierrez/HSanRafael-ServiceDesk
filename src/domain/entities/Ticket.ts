import { TicketPriority, TicketStatus } from "../value-objects/Status"
import { TicketId } from "../value-objects/TicketId"
import { UserId } from "../value-objects/UserId"
import { BaseEntity } from "./BaseEntity"
import type { CreateTicketInput, RehydrateTicketDto } from "../../application/dtos/ticket"
import type { TicketCreated } from "../events/TicketCreated"

/**
 * Entidad del dominio: Ticket
 * Representa un requerimiento o incidente dentro del sistema de soporte.
 */
export class Ticket extends BaseEntity<TicketId> {
    public constructor(
        id: TicketId,
        public title: string,
        public description: string,
        public status: TicketStatus,
        public priority: TicketPriority,
        readonly requesterId: UserId,
        public assigneeId: UserId | null,
        readonly areaId: string,
        public slaTargetAt: Date | null,
        public slaBreached: boolean,
        public firstResponseAt: Date | null,
        public resolvedAt: Date | null,
        public closedAt: Date | null,
        public resolutionSummary: string | null,
        createdAt: Date,
    ) {
        super(id, createdAt)
    }

    /**
     * Fábrica para crear un nuevo ticket desde una solicitud de usuario.
     * Calcula el SLA objetivo y registra el evento de creación.
     */
    public static create(dto: CreateTicketInput, slaMinutes: number | null, now: Date): Ticket {
        const slaTargetAt = slaMinutes ? new Date(now.getTime() + slaMinutes * 60000) : null
        const createdAt = dto.createdAt ? new Date(dto.createdAt) : now;

        const ticket = new Ticket(
            TicketId.new(),
            dto.title.trim(),
            dto.description.trim(),
            "OPEN",
            dto.priority,
            UserId.from(dto.userId),    
            null,
            dto.areaId,
            slaTargetAt,
            false,
            null,
            null,
            null,
            null,
            createdAt,
        )

        const event: TicketCreated = {
            type: "ticket.created",
            occurredAt: now,
            payload: {
                id: ticket.id.toString(),
                title: ticket.title,
                userId: ticket.requesterId.toString(),
                areaId: ticket.areaId,
            },
        }

        ticket.recordEvent(event)
        return ticket
    }

    /**
     * Restaura un ticket desde una fuente persistente (por ejemplo, la base de datos).
     */
    public static rehydrate(row: RehydrateTicketDto): Ticket {
        return new Ticket(
            TicketId.from(row.id),
            row.title.trim(),
            row.description,
            row.status,
            row.priority,
            UserId.from(row.userId),
            row.assigneeId ? UserId.from(row.assigneeId) : null,
            row.areaId,
            row.slaTargetAt ? new Date(row.slaTargetAt) : null,
            row.slaBreached ?? false,
            row.firstResponseAt ? new Date(row.firstResponseAt) : null,
            row.resolvedAt ? new Date(row.resolvedAt) : null,
            row.closedAt ? new Date(row.closedAt) : null,
            row.resolutionSummary ?? null,
            new Date(row.createdAt),
        )
    }

    /**
     * Asigna un técnico o agente al ticket.
     */
    public assign(assigneeId: UserId, now: Date): void {
        this.assigneeId = assigneeId

        this.recordEvent({
            type: "ticket.assigned",
            occurredAt: now,
            payload: {
                ticketId: this.id.toString(),
                assigneeId: assigneeId.toString(),
            },
        })
    }

    /**
     * Cambia el estado del ticket y registra el evento correspondiente.
     */
    public transition(newStatus: TicketStatus, now: Date): void {
        const oldStatus = this.status
        this.status = newStatus

        if (newStatus === "RESOLVED") this.resolvedAt = now
        if (newStatus === "CLOSED") this.closedAt = now

        this.recordEvent({
            type: "ticket.transitioned",
            occurredAt: now,
            payload: { ticketId: this.id.toString(), oldStatus, newStatus },
        })
    }

    /**
     * Marca la primera respuesta al ticket (solo la primera vez).
     */
    public markFirstResponse(now: Date): void {
        if (!this.firstResponseAt) {
            this.firstResponseAt = now
        }
    }

    /**
     * Verifica si el SLA fue incumplido y registra el evento si aplica.
     */
    public checkSLABreach(now: Date): boolean {
        if (this.slaTargetAt && now > this.slaTargetAt && !this.slaBreached) {
            this.slaBreached = true
            this.recordEvent({
                type: "ticket.sla_breached",
                occurredAt: now,
                payload: { ticketId: this.id.toString(), slaTargetAt: this.slaTargetAt },
            })
            return true
        }
        return false
    }
}
