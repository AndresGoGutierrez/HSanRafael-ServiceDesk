import { TicketPriority, TicketStatus } from "../value-objects/Status"
import { TicketId } from "../value-objects/TicketId"
import { UserId } from "../value-objects/UserId"
import { BaseEntity } from "./BaseEntity"
import type { CreateTicketInput, RehydrateTicketDto } from "../../application/dtos/ticket"
import type { TicketCreated } from "../events/TicketCreated"

/**
 * Domain entity: Ticket
 * Represents a request or incident within the support system.
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
     * Factory for creating a new ticket from a user request.
     * Calculates the target SLA and logs the creation event.
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
     * Restores a ticket from a persistent source (e.g., the database).
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
     * Assigns a technician or agent to the ticket.
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
     * Changes the ticket status and logs the corresponding event.
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
     * Marks the first response to the ticket (only the first time).
     */
    public markFirstResponse(now: Date): void {
        if (!this.firstResponseAt) {
            this.firstResponseAt = now
        }
    }

    /**
     * Checks if the SLA was breached and logs the event if applicable.
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
