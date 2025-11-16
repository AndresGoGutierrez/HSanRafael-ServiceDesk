import { Attachment } from "../../domain/entities/Attachment"
import { CreateAttachmentSchema, type CreateAttachmentInput } from "../dtos/attachment"
import { type AttachmentRepository } from "../ports/AttachmentRepository"
import { type Clock } from "../ports/Clock"
import { type EventBus } from "../ports/EventBus"

/**
 * Use Case: AddAttachment
 * -----------------------
 * Responsible for creating a new attachment in the system.
 * 
 * Orchestrates validation operations, entity creation,
 * persistence in the repository, and publication of domain events.
 */
export class AddAttachment {
    constructor(
        private readonly repository: AttachmentRepository,
        private readonly clock: Clock,
        private readonly eventBus: EventBus,
    ) { }

    /**
     * Executes the use case.
     *
     * @param input Data to create the attachment.
     * @returns The Attachment entity created.
     * @throws {ZodError} If the DTO does not comply with the validation rules.
     */
    async execute(input: CreateAttachmentInput): Promise<Attachment> {
        // Validate input using Zod (DTO)
        const validated = CreateAttachmentSchema.parse(input)

        // Create domain entity with current clock date injected
        const attachment = Attachment.create(validated, this.clock.now())

        // Persist in the repository
        await this.repository.save(attachment)

        // Publish domain events (if any)
        const events = attachment.pullDomainEvents()
        if (events.length > 0) {
            await this.eventBus.publishAll(events)
        }

        return attachment
    }
}
