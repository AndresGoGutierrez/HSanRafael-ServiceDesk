import type { TicketRepository } from "../ports/TicketRepository";
import type { Clock } from "../ports/Clock";
import type { EventBus } from "../ports/EventBus";
import type { TransitionTicketInput } from "../dtos/ticket";
import { TicketId } from "../../domain/value-objects/TicketId";

/**
 * Use case: Transition the status of a ticket.
 *
 * This use case is responsible for changing the status of a ticket
 * within the domain, ensuring that:
 *  - The ticket exists.
 *  - The status transition is valid (according to the domain rules).
 *  - The generated domain events are published.
 *
 * Principles applied:
 * - Clean Architecture: no infrastructure dependencies.
 * - DDD: the transition logic belongs to the Ticket entity.
 * - SRP: this use case only orchestrates, it does not validate business rules.
 */
export class TransitionTicketStatus {
    constructor(
        private readonly ticketRepository: TicketRepository,
        private readonly clock: Clock,
        private readonly eventBus: EventBus,
    ) { }

    /**
     * Executes the status transition of an existing ticket.
     *
     * @param ticketIdString - Ticket identifier as a string (UUID).
     * @param input - Data with the new status to transition to.
     * @throws Error if the ticket does not exist or the transition is invalid.
     */
    async execute(ticketIdString: string, input: TransitionTicketInput): Promise<void> {
        // Convert the string to a Value Object
        const ticketId = TicketId.from(ticketIdString);

        // Search for the ticket in the repository
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new Error(`Ticket with id ${ticketIdString} not found`);
        }

        // Execute the transition within the domain
        ticket.transition(input.status, this.clock.now());

        // Persist with change
        await this.ticketRepository.save(ticket);

        // Publish generated domain events
        const domainEvents = ticket.pullDomainEvents();
        await this.eventBus.publishAll(domainEvents);
    }
}
