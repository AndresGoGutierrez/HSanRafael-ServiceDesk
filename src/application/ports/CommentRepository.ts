import type { Comment } from "../../domain/entities/Comment"

/**
 * Persistence contract for the Comment entity.
 * 
 * Defines the operations that any implementation (e.g., Prisma, Mongo, or memory)
 * must comply with to handle comments within the domain.
 */
export interface CommentRepository {
    /**
     * Persists a new or updated comment in the data source.
     */
    save(comment: Comment): Promise<void>

    /**
     * Searches for a comment by its unique identifier.
     * @param id Comment identifier.
     * @returns The comment or null if it does not exist.
     */
    findById(id: string): Promise<Comment | null>

    /**
     * Gets all comments associated with a ticket.
     * @param ticketId Ticket identifier.
     */
    findByTicketId(ticketId: string): Promise<Comment[]>

    delete?(id: string): Promise<void>
}
