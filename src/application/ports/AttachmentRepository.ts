import type { Attachment } from "../../domain/entities/Attachment";

/**
<<<<<<< HEAD
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
    save(attachment: Attachment): Promise<void>;

    /**
     * Busca un adjunto por su identificador único.
     * @param id - UUID del adjunto.
     * @returns La entidad Attachment si existe, o `null` si no se encuentra.
     */
    findById(id: string): Promise<Attachment | null>;

    /**
     * Recupera todos los adjuntos asociados a un ticket específico.
     * @param ticketId - UUID del ticket.
     * @returns Lista de adjuntos relacionados con el ticket.
     */
    findByTicketId(ticketId: string): Promise<Attachment[]>;

    /**
     * Marca un adjunto como eliminado (soft delete).
     * @param id - UUID del adjunto a eliminar.
     */
    deleteById(id: string): Promise<void>;
=======
 * Attachments repository
 * 
 * Defines the operations necessary for persistence and retrieval
 * of attachments, following the dependency inversion principle.
 * 
 * This interface is implemented in the infrastructure layer
 * (e.g., Prisma, Sequelize, or persistence in S3).
 */
export interface AttachmentRepository {
  /**
   * Persists an attachment in the storage system.
   * @param attachment - Attachment entity to save.
   */
  save(attachment: Attachment): Promise<void>

  /**
   * Searches for an attachment by its unique identifier.
   * @param id - UUID of the attachment.
   * @returns The Attachment entity if it exists, or null if it is not found.
   */
  findById(id: string): Promise<Attachment | null>

  /**
   * Retrieves all attachments associated with a specific ticket.
   * @param ticketId - UUID of the ticket.
   * @returns List of attachments related to the ticket.
   */
  findByTicketId(ticketId: string): Promise<Attachment[]>

  /**
   * Marks an attachment as deleted (soft delete).
   * @param id - UUID of the attachment to be deleted.
   */
  deleteById(id: string): Promise<void>
>>>>>>> main
}
