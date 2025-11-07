import { TicketId } from "../../domain/value-objects/TicketId";
import type { AttachmentRepository } from "../ports/AttachmentRepository";
import type { Attachment } from "../../domain/entities/Attachment";

/**
 * Caso de uso: Listar todos los archivos adjuntos asociados a un ticket.
 * 
 * Este caso de uso:
 * - Convierte el ID externo (string) a un Value Object (`TicketId`)
 * - Solicita al repositorio los adjuntos asociados a ese ticket
 * - Asegura que siempre se devuelva una lista (aunque esté vacía)
 */
export class ListAttachmentsByTicket {
    constructor(private readonly repo: AttachmentRepository) { }

    async execute(ticketId: string): Promise<Attachment[]> {
        if (!ticketId) {
            throw new Error("El ID del ticket no puede estar vacío.");
        }

        // Se valida que el ID sea un UUID válido (por consistencia con el dominio)
        const id = TicketId.from(ticketId);

        // Convertimos explícitamente a string antes de pasar al repositorio
        const attachments = await this.repo.findByTicketId(id.toString());

        return attachments ?? [];
    }
}
