import type { RehydrateAttachmentDto } from "../../application/dtos/attachment"
import type { AttachmentRepository } from "../../application/ports/AttachmentRepository"
import { Attachment } from "../../domain/entities/Attachment"
import { prismaClient } from "../db/prisma"

/**
 * Mapper que traduce entre la entidad de dominio `Attachment`
 * y el modelo de datos de Prisma.
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
        }
    }

    static toDomain(record: unknown): Attachment {
        return Attachment.rehydrate(record as RehydrateAttachmentDto)
    }
}

/**
 * Implementación del repositorio de adjuntos (`AttachmentRepository`)
 * usando Prisma ORM.
 */
export class PrismaAttachmentRepository implements AttachmentRepository {
    /**
     * Guarda un nuevo adjunto en la base de datos.
     * Si ya existe, actualiza sus datos.
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
            },
        })
    }

    /**
     * Busca un adjunto por su identificador único.
     * @param id ID del adjunto
     * @returns Entidad `Attachment` o `null` si no existe.
     */
    async findById(id: string): Promise<Attachment | null> {
        const record = await prismaClient.attachment.findUnique({ where: { id } })
        return record ? AttachmentMapper.toDomain(record) : null
    }

    /**
     * Obtiene todos los adjuntos asociados a un ticket.
     * @param ticketId ID del ticket
     * @returns Lista de entidades `Attachment`
     */
    async findByTicketId(ticketId: string): Promise<Attachment[]> {
        const records = await prismaClient.attachment.findMany({
            where: { ticketId },
            orderBy: { createdAt: "asc" },
        })
        return records.map(AttachmentMapper.toDomain)
    }
}
