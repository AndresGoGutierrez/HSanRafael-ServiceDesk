import type { TicketRepository } from "../ports/TicketRepository";
import type { AreaRepository } from "../ports/AreaRepository";
import type { Clock } from "../ports/Clock";
import type { EventBus } from "../ports/EventBus";
import { CreateTicketSchema, type CreateTicketInput } from "../dtos/ticket";
import { Ticket } from "../../domain/entities/Ticket";

import type { AuditRepository } from "../ports/AuditRepository";
import { AuditTrail } from "../../domain/entities/AuditTrail";
import { UserId } from "../../domain/value-objects/UserId";
import { SLARepository } from "../ports/SLARepository";

/**
 * Use case: Create a new Ticket.
 * 
 * - Validates input data using Zod (CreateTicketSchema)
 * - Verifies that the area exists and obtains its SLA configuration
 * - Creates the Ticket entity applying business rules
 * - Persists the Ticket using the repository
 * - Publishes the generated domain events
 */
export class CreateTicket {
    constructor(
        private readonly ticketRepo: TicketRepository,
        private readonly areaRepo: AreaRepository,
        private readonly slaRepo: SLARepository,
        private readonly clock: Clock,
        private readonly eventBus: EventBus,
        private readonly auditRepo: AuditRepository,
    ) { }

    async execute(input: CreateTicketInput): Promise<Ticket> {
        // Validate DTO with Zod
        const validatedInput = CreateTicketSchema.parse(input);

        // Obtain the area (for SLA)
        const area = await this.areaRepo.findById(validatedInput.areaId);
        if (!area) {
            throw new Error("Área no encontrada");
        }

        // Get SLA time from the area
        const sla = await this.slaRepo.findByAreaId(area.id.toString());
        const slaMinutes = sla?.resolutionTimeMinutes ?? 0;


        // Create domain entity
        const ticket = Ticket.create(validatedInput, slaMinutes, this.clock.now());

        // Persist the ticket
        await this.ticketRepo.save(ticket);

        const audit = AuditTrail.create(
            {
                ticketId: ticket.id.toString(), 
                actorId: UserId.from(validatedInput.userId), 
                action: "CREATE_TICKET",
                entityType: "Ticket",
                entityId: ticket.id.toString(),
                changes: {
                    title: validatedInput.title,
                    description: validatedInput.description,
                    priority: validatedInput.priority,
                    areaId: validatedInput.areaId,
                },
                metadata: {
                    source: "API",
                },
            },
            this.clock.now(),
        );

        await this.auditRepo.save(audit);

        // Publish domain events
        const events = ticket.pullDomainEvents();
        await this.eventBus.publishAll(events);

        return ticket;
    }
}
