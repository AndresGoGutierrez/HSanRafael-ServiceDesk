import type { AuditRepository } from "../ports/AuditRepository";
import type { Clock } from "../ports/Clock";
import { AuditTrail, type CreateAuditTrailInput } from "../../domain/entities/AuditTrail";

/**
 * Use case: Log an action in the audit system.
 *
 * This use case encapsulates the logic for creating and persisting
 * an audit record (`AuditTrail`) when a relevant event occurs
 * in the domain (e.g., status change, update, or deletion).
 *
 * Clean Architecture principles:
 * - Does not depend on infrastructure details.
 * - Works only with domain entities and ports (repositories).
 * - Remains agnostic to the persistence framework or technology.
 */
export class RecordAudit {
    constructor(
        private readonly auditRepository: AuditRepository,
        private readonly clock: Clock,
    ) { }

    /**
     * Executes the registration of a new audit.
     *
     * @param input Data required to create the audit record.
     * @throws Error if the creation of the record fails due to validation or persistence.
     */
    async execute(input: CreateAuditTrailInput): Promise<void> {
        // Validate and create the domain entity
        const auditTrail = AuditTrail.create(input, this.clock.now());

        // Persist the record in the repository
        await this.auditRepository.save(auditTrail);
    }
}
