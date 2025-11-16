import { prismaClient } from "../db/prisma"
import type { CommentRepository } from "../../application/ports/CommentRepository"
import type { RehydrateCommentDto } from "../../application/dtos/comment"
import { Comment } from "../../domain/entities/Comment"

/**
 * Mapper responsible for transforming between the `Comment` domain entity
 * and the persistence model managed by Prisma.
 *
 * This pattern keeps the infrastructure decoupled from the domain layer,
 * following the principles of Clean Architecture.
 */

function unwrapId(id: { toString(): string } | string): string {
    return typeof id === "string" ? id : id.toString()
}

class CommentMapper {
    static toPersistence(comment: Comment) {
        return {
            id: comment.id.toString(),
            ticketId: unwrapId(comment.ticketId),
            authorId: unwrapId(comment.authorId),
            body: comment.body,
            isInternal: comment.isInternal,
            createdAt: comment.createdAt,
        }
    }

    static toDomain(row: any): Comment {
        const dto: RehydrateCommentDto = {
            id: row.id,
            ticketId: row.ticketId,
            authorId: row.authorId,
            body: row.body,
            isInternal: row.isInternal,
            createdAt: row.createdAt,
        }
        return Comment.rehydrate(dto)
    }
}

/**
 * Implementation of `CommentRepository` using Prisma ORM.
 * Responsible for the persistence of the `Comment` entity.
 */
export class PrismaCommentRepository implements CommentRepository {
    /**
     * Persists a comment in the database.
     * Uses `create` because comments are immutable (they are not overwritten).
     */
    async save(comment: Comment): Promise<void> {
        const data = CommentMapper.toPersistence(comment)
        await prismaClient.comment.create({ data })
    }

    /**
     * Searches for a comment by its unique identifier.
     * Returns a domain entity or `null` if it does not exist.
     */
    async findById(id: string): Promise<Comment | null> {
        const row = await prismaClient.comment.findUnique({
            where: { id },
        })

        return row ? CommentMapper.toDomain(row) : null
    }

    /**
     * Gets all comments associated with a ticket.
     * Comments are returned in ascending chronological order.
     */
    async findByTicketId(ticketId: string): Promise<Comment[]> {
        const rows = await prismaClient.comment.findMany({
            where: { ticketId },
            orderBy: { createdAt: "asc" },
        })

        return rows.map(CommentMapper.toDomain)
    }
}
