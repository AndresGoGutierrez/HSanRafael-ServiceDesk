import { TicketId } from "../../domain/value-objects/TicketId"
import { UserId } from "../../domain/value-objects/UserId"
import type { TicketRepository } from "../ports/TicketRepository"
import type { Clock } from "../ports/Clock"
import type { EventBus } from "../ports/EventBus"
import { AssignTicketSchema, type AssignTicketInput } from "../dtos/ticket"

/**
 * Use case: Assign a ticket to a user.
 * 
 * Validates the data, retrieves the ticket, applies the business logic, 
 * and publishes the resulting events.
 */
export class AssignTicket {
  constructor(
    private readonly repository: TicketRepository,
    private readonly clock: Clock,
    private readonly eventBus: EventBus,
  ) {}

  async execute(ticketId: string, input: AssignTicketInput): Promise<void> {
    // Validate input
    const validated = AssignTicketSchema.parse(input)

    // Convert to domain value objects
    const domainTicketId = TicketId.from(ticketId)
    const assigneeId = UserId.from(validated.assigneeId)

    //Retrieve ticket
    const ticket = await this.repository.findById(domainTicketId)
    if (!ticket) {
      throw new Error(`Ticket with ID ${ticketId} not found.`)
    }

    // Execute domain logic
    ticket.assign(assigneeId, this.clock.now())

    // Persist changes
    await this.repository.save(ticket)

    // Publish domain events (if any)
    const events = ticket.pullDomainEvents()
    if (events.length > 0) {
      await this.eventBus.publishAll(events)
    }
  }
}
