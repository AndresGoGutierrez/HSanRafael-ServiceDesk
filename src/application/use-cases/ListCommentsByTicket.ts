import { TicketId } from "../../domain/value-objects/TicketId";
import type { CommentRepository } from "../ports/CommentRepository";
import type { Comment } from "../../domain/entities/Comment";

/**
 * Use case: List all comments associated with a ticket.
 *
 * This use case queries the comment repository to retrieve
 * all comments linked to a specific ticket.
 */
export class ListCommentsByTicket {
    constructor(private readonly repo: CommentRepository) { }

    /**
     * Executes the use case of listing comments by ticket.
     * 
     * @param ticketId - Ticket identifier (UUID in string)
     * @returns List of comments associated with the ticket.
     * @throws Error if the ticketId is invalid or there are no comments.
     */
    async execute(ticketId: string): Promise<Comment[]> {
        if (!ticketId?.trim()) {
            throw new Error("El ID del ticket no puede estar vacío.");
        }

        // Validation using domain value object
        const id = TicketId.from(ticketId);

        // We convert to string before passing to the repository (infrastructure)
        const comments = await this.repo.findByTicketId(id.toString());

        // We guarantee consistent returns
        return comments ?? [];
    }
}
