import { prismaClient } from "../db/prisma";
import type { CommentRepository } from "../../application/ports/CommentRepository";
import type { RehydrateCommentDto } from "../../application/dtos/comment";
import { Comment } from "../../domain/entities/Comment";

/**
 * Mapper encargado de transformar entre la entidad de dominio `Comment`
 * y el modelo de persistencia manejado por Prisma.
 *
 * Este patrón mantiene la infraestructura desacoplada de la capa de dominio,
 * siguiendo los principios de Clean Architecture.
 */

function unwrapId(id: { toString(): string } | string): string {
    return typeof id === "string" ? id : id.toString();
}

class CommentMapper {
    static toPersistence(comment: Comment): {
        id: string;
        ticketId: string;
        authorId: string;
        body: string;
        isInternal: boolean;
        createdAt: Date;
    } {
        return {
            id: comment.id.toString(),
            ticketId: unwrapId(comment.ticketId),
            authorId: unwrapId(comment.authorId),
            body: comment.body,
            isInternal: comment.isInternal,
            createdAt: comment.createdAt,
        };
    }

    static toDomain(row: unknown): Comment {
        const r = row as Record<string, unknown>;
        const dto: RehydrateCommentDto = {
            id: r.id as string,
            ticketId: r.ticketId as string,
            authorId: r.authorId as string,
            body: r.body as string,
            isInternal: (r.isInternal as boolean) ?? false,
            createdAt: r.createdAt as Date,
        };
        return Comment.rehydrate(dto);
    }
}

/**
 * Implementación de `CommentRepository` usando Prisma ORM.
 * Responsable de la persistencia de la entidad `Comment`.
 */
export class PrismaCommentRepository implements CommentRepository {
    /**
     * Persiste un comentario en la base de datos.
     * Usa `create` porque los comentarios son inmutables (no se sobrescriben).
     */
    async save(comment: Comment): Promise<void> {
        const data = CommentMapper.toPersistence(comment);
        await prismaClient.comment.create({ data });
    }

    /**
     * Busca un comentario por su identificador único.
     * Retorna una entidad de dominio o `null` si no existe.
     */
    async findById(id: string): Promise<Comment | null> {
        const row = await prismaClient.comment.findUnique({
            where: { id },
        });

        return row ? CommentMapper.toDomain(row) : null;
    }

    /**
     * Obtiene todos los comentarios asociados a un ticket.
     * Los comentarios se devuelven en orden cronológico ascendente.
     */
    async findByTicketId(ticketId: string): Promise<Comment[]> {
        const rows = await prismaClient.comment.findMany({
            where: { ticketId },
            orderBy: { createdAt: "asc" },
        });

        return rows.map(CommentMapper.toDomain);
    }
}
