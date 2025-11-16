import { TicketId } from "../../domain/value-objects/TicketId";
import type { TicketRepository } from "../ports/TicketRepository";
import type { Ticket } from "../../domain/entities/Ticket";

/**
 * Use case: Get a ticket by its identifier.
 * 
 * - Accepts a string as external input (from a controller or API layer)
 * - Converts it to a Value Object (`TicketId`) to maintain consistency in the domain
 * - Delegate the search to the repository
 */
export class GetTicketById {
  constructor(private readonly ticketRepo: TicketRepository) {}

  async execute(ticketId: string): Promise<Ticket | null> {
    if (!ticketId) {
      throw new Error("El ID del ticket no puede estar vacío.");
    }

    // We convert the string to a Value Object
    const id = TicketId.from(ticketId);

    // The repository receives a domain object, not a primitive type.
    const ticket = await this.ticketRepo.findById(id);

    return ticket ?? null;
  }
}
