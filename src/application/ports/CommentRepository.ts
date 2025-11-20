import type { Comment } from "../../domain/entities/Comment";

/**
<<<<<<< HEAD
 * Contrato de persistencia para la entidad Comment.
 *
 * Define las operaciones que cualquier implementación (por ejemplo, Prisma, Mongo, o memoria)
 * debe cumplir para manejar comentarios dentro del dominio.
=======
 * Persistence contract for the Comment entity.
 * 
 * Defines the operations that any implementation (e.g., Prisma, Mongo, or memory)
 * must comply with to handle comments within the domain.
>>>>>>> main
 */
export interface CommentRepository {
    /**
     * Persists a new or updated comment in the data source.
     */
    save(comment: Comment): Promise<void>;

    /**
     * Searches for a comment by its unique identifier.
     * @param id Comment identifier.
     * @returns The comment or null if it does not exist.
     */
    findById(id: string): Promise<Comment | null>;

    /**
     * Gets all comments associated with a ticket.
     * @param ticketId Ticket identifier.
     */
    findByTicketId(ticketId: string): Promise<Comment[]>;

<<<<<<< HEAD
    /**
     * Elimina un comentario por su identificador.
     * (Opcional — solo si tu caso de uso lo requiere)
     */
    delete?(id: string): Promise<void>;
=======
    delete?(id: string): Promise<void>
>>>>>>> main
}
