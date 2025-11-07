import type { Comment } from "../../domain/entities/Comment"

/**
 * Contrato de persistencia para la entidad Comment.
 * 
 * Define las operaciones que cualquier implementación (por ejemplo, Prisma, Mongo, o memoria)
 * debe cumplir para manejar comentarios dentro del dominio.
 */
export interface CommentRepository {
    /**
     * Persiste un comentario nuevo o actualizado en la fuente de datos.
     */
    save(comment: Comment): Promise<void>

    /**
     * Busca un comentario por su identificador único.
     * @param id Identificador del comentario.
     * @returns El comentario o null si no existe.
     */
    findById(id: string): Promise<Comment | null>

    /**
     * Obtiene todos los comentarios asociados a un ticket.
     * @param ticketId Identificador del ticket.
     */
    findByTicketId(ticketId: string): Promise<Comment[]>

    /**
     * Elimina un comentario por su identificador.
     * (Opcional — solo si tu caso de uso lo requiere)
     */
    delete?(id: string): Promise<void>
}
