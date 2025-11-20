import type { TicketRepository } from "../ports/TicketRepository";
import type { AuditRepository } from "../ports/AuditRepository";
import type { EventBus } from "../ports/EventBus";
import type { Clock } from "../ports/Clock";
import { TicketId } from "../../domain/value-objects/TicketId";
import type { TicketStatus } from "../../domain/value-objects/Status";
import { UserId } from "../../domain/value-objects/UserId";
import { AuditTrail } from "../../domain/entities/AuditTrail";

/**
 * Data required to close a ticket
 */
export interface CloseTicketInput {
    ticketId: string;
    resolutionSummary: string;
    notifyRequester: boolean;
    actorId: string;
}

/**
 * Use case: Close a ticket in the system
 *
 * This use case orchestrates the business logic of closing a ticket:
 * - Verify existence and status.
 * - Mark the ticket as resolved and then closed.
 * - Persist changes and log audit.
 * - Issue a domain event if notification is required.
 */
export class CloseTicket {
    constructor(
        private readonly ticketRepository: TicketRepository,
        private readonly auditRepository: AuditRepository,
        private readonly eventBus: EventBus,
        private readonly clock: Clock,
    ) {}

    async execute(input: CloseTicketInput): Promise<void> {
        const ticketId = TicketId.from(input.ticketId);
        const now = this.clock.now();

        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new Error("Ticket no encontrado");
        }

        // Check current status
        if (ticket.status === "CLOSED") {
            throw new Error("El ticket ya está cerrado.");
        }

        // If it is still unresolved, it is first marked as resolved.
        if (ticket.status !== "RESOLVED") {
            ticket.transition("RESOLVED" as TicketStatus, now);
        }

        // Close the ticket with its summary
        ticket.resolutionSummary = input.resolutionSummary
        ticket.transition("CLOSED" as TicketStatus, now)

        await this.ticketRepository.save(ticket);

        // Record audit
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
            now 
        )

        await this.auditRepository.save(audit);

        // Publish event to notify the applicant
        if (input.notifyRequester && ticket.requesterId) {
            await this.eventBus.publish({
                type: "ticket.closed",
                occurredAt: now,
                payload: {
                    ticketId: ticketId.toString(),
                    requesterId: ticket.requesterId.toString(),
                    resolutionSummary: input.resolutionSummary,
                },
            });
        }
    }
}
