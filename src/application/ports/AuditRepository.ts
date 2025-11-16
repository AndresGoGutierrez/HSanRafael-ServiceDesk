import type { AuditTrail } from "../../domain/entities/AuditTrail"

/**
 * Port (interface) that defines the operations available for
 * persistence and querying of domain audits.
 *
 * Complies with the dependency inversion principle in Clean Architecture:
 * the domain layer does not depend on infrastructure (DB, ORM, etc.).
 */
export interface AuditRepository {
  /**
   * Persists an audit log.
   * If it already exists, it may be overwritten or ignored depending on the implementation.
   */
  save(audit: AuditTrail): Promise<void>

  /**
   * Gets all audits related to a specific ticket.
   */
  findByTicketId(ticketId: string): Promise<AuditTrail[]>

  /**
   * Gets all audits performed by a specific actor (user or system).
   */
  findByActorId(actorId: string): Promise<AuditTrail[]>

  /**
   * Gets the audits associated with a specific entity (e.g., Ticket, Area, User).
   */
  findByEntity(entityType: string, entityId: string): Promise<AuditTrail[]>
}
