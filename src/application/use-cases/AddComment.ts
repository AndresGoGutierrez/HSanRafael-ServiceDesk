import { Comment } from "../../domain/entities/Comment";
import { TicketId } from "../../domain/value-objects/TicketId";
import { UserId } from "../../domain/value-objects/UserId";
import { type CommentRepository } from "../ports/CommentRepository";
import { type Clock } from "../ports/Clock";
import { type EventBus } from "../ports/EventBus";
import { CreateCommentSchema, type CreateCommentInput } from "../dtos/comment";

/**
 * Use case: Add comment to a ticket.
 */
export class AddComment {
    constructor(
        private readonly repository: CommentRepository,
        private readonly clock: Clock,
        private readonly eventBus: EventBus,
    ) {}

  async execute(input: CreateCommentInput & { ticketId: string; authorId: string }): Promise<Comment> {
    // Validate only the body (body, isInternal)
    const validated = CreateCommentSchema.parse(input)

    // Convert to domain value objects
    const domainInput = {
      ...validated,
      ticketId: TicketId.from(input.ticketId),
      authorId: UserId.from(input.authorId),
    }

    // Create the domain entity
    const comment = Comment.create(domainInput, this.clock.now())

    // Persist in the repository
    await this.repository.save(comment)

    //Publish domain events (if any)
    const events = comment.pullDomainEvents()
    if (events.length > 0) {
      await this.eventBus.publishAll(events)
    }

    return comment
  }
}
