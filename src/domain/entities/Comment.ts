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
 * Entidad de dominio que representa un comentario en un ticket.
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
     * Fábrica de creación de comentarios.
     * Valida y emite el evento de dominio correspondiente.
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
     * Reconstrucción de un comentario desde una fuente persistida.
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
