import type { Attachment } from "../../domain/entities/Attachment"

/**
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
}
