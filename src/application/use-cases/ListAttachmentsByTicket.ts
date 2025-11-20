import { TicketId } from "../../domain/value-objects/TicketId";
import type { AttachmentRepository } from "../ports/AttachmentRepository";
import type { Attachment } from "../../domain/entities/Attachment";

/**
 * Use case: List all attachments associated with a ticket.
 * 
 * This use case:
 * - Converts the external ID (string) to a Value Object (`TicketId`)
 * - Requests the attachments associated with that ticket from the repository
 * - Ensures that a list is always returned (even if it is empty)
 */
export class ListAttachmentsByTicket {
    constructor(private readonly repo: AttachmentRepository) { }

    async execute(ticketId: string): Promise<Attachment[]> {
        if (!ticketId) {
            throw new Error("El ID del ticket no puede estar vacío.");
        }

        // Validate that the ID is a valid UUID (for consistency with the domain)
        const id = TicketId.from(ticketId);

        // We explicitly convert to string before passing to the repository
        const attachments = await this.repo.findByTicketId(id.toString());

        return attachments ?? [];
    }
}
