import { BaseEntity } from "./BaseEntity"
import { CommentId } from "../value-objects/CommentId"
import { UserId } from "../value-objects/UserId"
import { TicketId } from "../value-objects/TicketId"

export interface CreateCommentInput {
    ticketId: TicketId
    authorId: UserId
    body: string
    isInternal?: boolean
}

export interface RehydrateCommentDto {
    id: string
    ticketId: string
    authorId: string
    body: string
    isInternal: boolean
    createdAt: Date
}

/**
 * Domain entity representing a comment on a ticket.
 */
export class Comment extends BaseEntity<CommentId> {
    public constructor(
        id: CommentId,
        public readonly ticketId: TicketId,
        public readonly authorId: UserId,
        public readonly body: string,
        public readonly isInternal: boolean,
        createdAt: Date,
    ) {
        super(id, createdAt)
    }

    /**
     * Comment creation factory.
     * Validates and emits the corresponding domain event.
     */
    public static create(dto: CreateCommentInput, now: Date): Comment {
        if (!dto.body || dto.body.trim().length === 0) {
            throw new Error("El cuerpo del comentario no puede estar vacío.")
        }

        const comment = new Comment(
            CommentId.new(),
            dto.ticketId,
            dto.authorId,
            dto.body.trim(),
            dto.isInternal ?? false,
            now,
        )

        comment.recordEvent({
            type: "comment.created",
            occurredAt: now,
            payload: {
                id: comment.id.toString(),
                ticketId: comment.ticketId.toString(),
                authorId: comment.authorId.toString(),
                isInternal: comment.isInternal,
            },
        })

        return comment
    }

    /**
     * Reconstructing a comment from a persistent source.
     */
    public static rehydrate(row: RehydrateCommentDto): Comment {
        return new Comment(
            CommentId.from(row.id),
            TicketId.from(row.ticketId),
            UserId.from(row.authorId),
            row.body,
            row.isInternal,
            new Date(row.createdAt),
        )
    }
}
