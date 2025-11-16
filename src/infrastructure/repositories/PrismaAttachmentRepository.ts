import type { RehydrateAttachmentDto } from "../../application/dtos/attachment"
import type { AttachmentRepository } from "../../application/ports/AttachmentRepository"
import { Attachment } from "../../domain/entities/Attachment"
import { prismaClient } from "../db/prisma"

/**
 * Mapper that translates between the domain entity `Attachment`
 * and the Prisma data model.
 */
class AttachmentMapper {
    static toPrisma(attachment: Attachment) {
        return {
            id: attachment.id.toString(),
            ticketId: attachment.ticketId,
            uploaderId: attachment.uploaderId,
            filename: attachment.filename,
            contentType: attachment.contentType,
            size: attachment.size,
            url: attachment.url,
            createdAt: attachment.createdAt,
            deletedAt: attachment.deletedAt ?? null,
        }
    }

    static toDomain(record: unknown): Attachment {
        return Attachment.rehydrate(record as RehydrateAttachmentDto)
    }
}

/**
 * Implementation of the attachment repository (`AttachmentRepository`)
 * using Prisma ORM.
 */
export class PrismaAttachmentRepository implements AttachmentRepository {
    /**
     * Saves a new attachment to the database.
     * If it already exists, updates its data.
     */
    async save(attachment: Attachment): Promise<void> {
        const data = AttachmentMapper.toPrisma(attachment)

        await prismaClient.attachment.upsert({
            where: { id: data.id },
            create: data,
            update: {
                filename: data.filename,
                contentType: data.contentType,
                size: data.size,
                url: data.url,
                deletedAt: data.deletedAt,
            },
        })

    }

    /**
     * Searches for an attachment by its unique identifier.
     * @param id ID of the attachment
     * @returns `Attachment` entity or `null` if it does not exist.
     */
    async findById(id: string): Promise<Attachment | null> {
        const record = await prismaClient.attachment.findUnique({ where: { id } })
        return record ? AttachmentMapper.toDomain(record) : null
    }

    /**
     * Gets all attachments associated with a ticket.
     * @param ticketId Ticket ID
     * @returns List of `Attachment` entities
     */
    async findByTicketId(ticketId: string): Promise<Attachment[]> {
        const records = await prismaClient.attachment.findMany({
            where: {
                ticketId,
                deletedAt: null,
            },
            orderBy: { createdAt: "asc" },
        })
        return records.map(AttachmentMapper.toDomain)
    }

    /**
     * Marks an attachment as deleted (soft delete).
     */
    async deleteById(id: string): Promise<void> {
        try {
            await prismaClient.attachment.update({
                where: { id },
                data: { deletedAt: new Date() },
            })
        } catch (error: any) {
            if (error.code === "P2025") {
                return
            }
            throw new Error(`Error eliminando Attachment con id ${id}: ${error.message}`)
        }
    }

}
