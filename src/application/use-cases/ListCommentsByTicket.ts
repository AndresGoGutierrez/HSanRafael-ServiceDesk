import { TicketId } from "../../domain/value-objects/TicketId";
import type { CommentRepository } from "../ports/CommentRepository";
import type { Comment } from "../../domain/entities/Comment";

/**
 * Caso de uso: Listar todos los comentarios asociados a un ticket.
 *
 * Este caso de uso consulta el repositorio de comentarios para recuperar
 * todos los comentarios vinculados a un ticket específico.
 */
export class ListCommentsByTicket {
    constructor(private readonly repo: CommentRepository) { }

    /**
     * Ejecuta el caso de uso de listado de comentarios por ticket.
     * 
     * @param ticketId - Identificador del ticket (UUID en string)
     * @returns Lista de comentarios asociados al ticket.
     * @throws Error si el ticketId es inválido o no existen comentarios.
     */
    async execute(ticketId: string): Promise<Comment[]> {
        if (!ticketId?.trim()) {
            throw new Error("El ID del ticket no puede estar vacío.");
        }

        // Validación mediante value object del dominio
        const id = TicketId.from(ticketId);

        // Convertimos a string antes de pasar al repositorio (infraestructura)
        const comments = await this.repo.findByTicketId(id.toString());

        // Garantizamos retorno consistente
        return comments ?? [];
    }
}
