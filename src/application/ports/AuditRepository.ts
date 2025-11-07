import type { AuditTrail } from "../../domain/entities/AuditTrail"

/**
 * Puerto (interface) que define las operaciones disponibles para
 * la persistencia y consulta de auditorías del dominio.
 *
 * Cumple el principio de inversión de dependencias en Clean Architecture:
 * la capa de dominio no depende de infraestructura (DB, ORM, etc.).
 */
export interface AuditRepository {
  /**
   * Persiste un registro de auditoría.
   * Si ya existe, puede sobrescribir o ignorar según la implementación.
   */
  save(audit: AuditTrail): Promise<void>

  /**
   * Obtiene todas las auditorías relacionadas con un ticket específico.
   */
  findByTicketId(ticketId: string): Promise<AuditTrail[]>

  /**
   * Obtiene todas las auditorías realizadas por un actor específico (usuario o sistema).
   */
  findByActorId(actorId: string): Promise<AuditTrail[]>

  /**
   * Obtiene las auditorías asociadas a una entidad concreta (por ejemplo, Ticket, Area, User).
   */
  findByEntity(entityType: string, entityId: string): Promise<AuditTrail[]>

  /**
   * (Opcional futuro) Lista todos los registros de auditoría.
   * Puede incluir paginación o filtros.
   */
  // listAll?(): Promise<AuditTrail[]>
}
