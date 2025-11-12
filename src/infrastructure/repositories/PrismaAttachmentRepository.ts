import type { RehydrateAttachmentDto } from "../../application/dtos/attachment";
import type { AttachmentRepository } from "../../application/ports/AttachmentRepository";
import { Attachment } from "../../domain/entities/Attachment";
import { prismaClient } from "../db/prisma";

/**
 * Mapper que traduce entre la entidad de dominio `Attachment`
 * y el modelo de datos de Prisma.
 */
class AttachmentMapper {
    static toPrisma(attachment: Attachment): {
        id: string;
        ticketId: string;
        uploaderId: string;
        filename: string;
        contentType: string;
        size: number;
        url: string;
        createdAt: Date;
        deletedAt: Date | null;
    } {
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
        };
    }

    static toDomain(record: unknown): Attachment {
        return Attachment.rehydrate(record as RehydrateAttachmentDto);
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
        const data = AttachmentMapper.toPrisma(attachment);

        await prismaClient.attachment.upsert({
            where: { id: data.id },
            create: data,
            update: {
                filename: data.filename,
                contentType: data.contentType,
                size: data.size,
                url: data.url,
                deletedAt: data.deletedAt, // ✅ mantiene consistencia
            },
        });
    }

    /**
     * Busca un adjunto por su identificador único.
     * @param id ID del adjunto
     * @returns Entidad `Attachment` o `null` si no existe.
     */
    async findById(id: string): Promise<Attachment | null> {
        const record = await prismaClient.attachment.findUnique({ where: { id } });
        return record ? AttachmentMapper.toDomain(record) : null;
    }

    /**
     * Obtiene todos los adjuntos asociados a un ticket.
     * @param ticketId ID del ticket
     * @returns Lista de entidades `Attachment`
     */
    async findByTicketId(ticketId: string): Promise<Attachment[]> {
        const records = await prismaClient.attachment.findMany({
            where: {
                ticketId,
                deletedAt: null, // ✅ solo activos
            },
            orderBy: { createdAt: "asc" },
        });
        return records.map(AttachmentMapper.toDomain);
    }

    /**
     * Marca un adjunto como eliminado (soft delete).
     */
    async deleteById(id: string): Promise<void> {
        try {
            await prismaClient.attachment.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        } catch (error: any) {
            if (error.code === "P2025") {
                // Registro no encontrado, se ignora silenciosamente o logueas
                return;
            }
            throw new Error(`Error eliminando Attachment con id ${id}: ${error.message}`);
        }
    }
}
