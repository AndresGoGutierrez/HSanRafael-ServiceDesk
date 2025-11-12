import { Comment } from "../../domain/entities/Comment";
import { TicketId } from "../../domain/value-objects/TicketId";
import { UserId } from "../../domain/value-objects/UserId";
import { type CommentRepository } from "../ports/CommentRepository";
import { type Clock } from "../ports/Clock";
import { type EventBus } from "../ports/EventBus";
import { CreateCommentSchema, type CreateCommentInput } from "../dtos/comment";

/**
 * Caso de uso: Agregar comentario a un ticket.
 */
export class AddComment {
    constructor(
        private readonly repository: CommentRepository,
        private readonly clock: Clock,
        private readonly eventBus: EventBus,
    ) {}

    async execute(
        input: CreateCommentInput & { ticketId: string; authorId: string },
    ): Promise<Comment> {
        // 1️⃣ Validar solo el body (body, isInternal)
        const validated = CreateCommentSchema.parse(input);

        // 2️⃣ Convertir a Value Objects del dominio
        const domainInput = {
            ...validated,
            ticketId: TicketId.from(input.ticketId),
            authorId: UserId.from(input.authorId),
        };

        // 3️⃣ Crear la entidad de dominio
        const comment = Comment.create(domainInput, this.clock.now());

        // 4️⃣ Persistir en el repositorio
        await this.repository.save(comment);

        // 5️⃣ Publicar eventos de dominio (si los hay)
        const events = comment.pullDomainEvents();
        if (events.length > 0) {
            await this.eventBus.publishAll(events);
        }

        return comment;
    }
}
