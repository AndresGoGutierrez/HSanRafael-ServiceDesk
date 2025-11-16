import type { TicketRepository } from "../ports/TicketRepository"
import type { Ticket } from "../../domain/entities/Ticket"

/**
 * Use case: list all tickets in the system.
 * Returns the domain entities as provided by the repository.
 */
export class ListTickets {
  constructor(private readonly repo: TicketRepository) {}

  /**
   * Executes the listing operation.
   * May be extended with filters, sorting, or pagination in the future.
   * @returns Complete list of `Ticket` entities.
   */
  async execute(): Promise<Ticket[]> {
    const tickets = await this.repo.list()

    // Example of future extension:
    // return tickets.filter(t => t.isActive).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    return tickets
  }
}
