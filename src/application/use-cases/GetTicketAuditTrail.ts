import type { AuditRepository } from "../ports/AuditRepository";
import type { AuditTrail } from "../../domain/entities/AuditTrail";

/**
 * Use case: Obtain the audit trail for a ticket.
 *
 * - Validates the ticket identifier.
 * - Retrieves audited events from the repository.
 * - Maintains domain independence (no infrastructure dependencies).
 */
export class GetTicketAuditTrail {
    constructor(private readonly auditRepo: AuditRepository) { }

    async execute(ticketId: string): Promise<AuditTrail[]> {
        // Validate minimum input
        if (!ticketId || typeof ticketId !== "string") {
            throw new Error("El ID del ticket proporcionado no es válido.");
        }

        //  Get the records from the repository
        const auditTrail = await this.auditRepo.findByTicketId(ticketId);

        // If nothing is found, return an empty array (no error)
        return auditTrail ?? [];
    }
}
