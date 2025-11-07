import type { AuditRepository } from "../ports/AuditRepository";
import type { AuditTrail } from "../../domain/entities/AuditTrail";

/**
 * Caso de uso: Obtener el historial (audit trail) de un ticket.
 *
 * - Valida el identificador del ticket.
 * - Recupera los eventos auditados desde el repositorio.
 * - Mantiene la independencia del dominio (sin dependencias de infraestructura).
 */
export class GetTicketAuditTrail {
    constructor(private readonly auditRepo: AuditRepository) { }

    async execute(ticketId: string): Promise<AuditTrail[]> {
        // Validar entrada mínima
        if (!ticketId || typeof ticketId !== "string") {
            throw new Error("El ID del ticket proporcionado no es válido.");
        }

        //  Obtener los registros del repositorio
        const auditTrail = await this.auditRepo.findByTicketId(ticketId);

        // Si no se encuentra nada, devuelve un array vacío (no error)
        return auditTrail ?? [];
    }
}
