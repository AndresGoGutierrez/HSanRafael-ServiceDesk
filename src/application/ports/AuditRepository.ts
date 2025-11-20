import type { AuditTrail } from "../../domain/entities/AuditTrail";

/**
 * Port (interface) that defines the operations available for
 * persistence and querying of domain audits.
 *
 * Complies with the dependency inversion principle in Clean Architecture:
 * the domain layer does not depend on infrastructure (DB, ORM, etc.).
 */
export interface AuditRepository {
<<<<<<< HEAD
    /**
     * Persiste un registro de auditoría.
     * Si ya existe, puede sobrescribir o ignorar según la implementación.
     */
    save(audit: AuditTrail): Promise<void>;

    /**
     * Obtiene todas las auditorías relacionadas con un ticket específico.
     */
    findByTicketId(ticketId: string): Promise<AuditTrail[]>;

    /**
     * Obtiene todas las auditorías realizadas por un actor específico (usuario o sistema).
     */
    findByActorId(actorId: string): Promise<AuditTrail[]>;

    /**
     * Obtiene las auditorías asociadas a una entidad concreta (por ejemplo, Ticket, Area, User).
     */
    findByEntity(entityType: string, entityId: string): Promise<AuditTrail[]>;

    /**
     * (Opcional futuro) Lista todos los registros de auditoría.
     * Puede incluir paginación o filtros.
     */
    // listAll?(): Promise<AuditTrail[]>
=======
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
>>>>>>> main
}
