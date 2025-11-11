import type { Attachment } from "../../domain/entities/Attachment"

/**
 * Repositorio de adjuntos (Attachments)
 * 
 * Define las operaciones necesarias para la persistencia y recuperación
 * de adjuntos, siguiendo el principio de inversión de dependencias.
 * 
 * Esta interfaz se implementa en la capa de infraestructura
 * (por ejemplo, Prisma, Sequelize, o persistencia en S3).
 */
export interface AttachmentRepository {
  /**
   * Persiste un adjunto en el sistema de almacenamiento.
   * @param attachment - Entidad Attachment a guardar.
   */
  save(attachment: Attachment): Promise<void>

  /**
   * Busca un adjunto por su identificador único.
   * @param id - UUID del adjunto.
   * @returns La entidad Attachment si existe, o `null` si no se encuentra.
   */
  findById(id: string): Promise<Attachment | null>

  /**
   * Recupera todos los adjuntos asociados a un ticket específico.
   * @param ticketId - UUID del ticket.
   * @returns Lista de adjuntos relacionados con el ticket.
   */
  findByTicketId(ticketId: string): Promise<Attachment[]>

  /**
   * Marca un adjunto como eliminado (soft delete).
   * @param id - UUID del adjunto a eliminar.
   */
  deleteById(id: string): Promise<void>
}
