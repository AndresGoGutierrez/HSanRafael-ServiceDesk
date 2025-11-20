import { AttachmentId } from "../../domain/entities/Attachment"
import { UserId } from "../../domain/value-objects/UserId"
import { AuditTrail } from "../../domain/entities/AuditTrail"
import type { AttachmentRepository } from "../ports/AttachmentRepository"
import type { AuditRepository } from "../ports/AuditRepository"
import type { Clock } from "../ports/Clock"

/**
 * Use case: Delete an attachment (soft delete)
 * 
 * - Applies logical deletion (marks with deletedAt)
 * - Logs the action in the audit system
 * 
 * Complies with Clean Architecture principles:
 *  - Does not depend on infrastructure
 *  - Uses Value Objects for identities
 *  - Orchestrates pure business logic
 */
export class DeleteAttachment {
    constructor(
        private readonly attachmentRepository: AttachmentRepository,
        private readonly auditRepository: AuditRepository,
        private readonly clock: Clock,
    ) { }

    async execute(attachmentId: string, actorId: string): Promise<void> {
        const idVO = AttachmentId.from(attachmentId)
        const attachment = await this.attachmentRepository.findById(idVO.toString())

        if (!attachment) {
            throw new Error("Attachment not found") // o NotFoundError
        }

        if (attachment.deletedAt) {
            throw new Error("Attachment already deleted") // o ConflictError
        }

        const occurredAt = this.clock.now()
        attachment.markAsDeleted(occurredAt)
        await this.attachmentRepository.deleteById(attachmentId)


        const audit = AuditTrail.create({
            actorId: UserId.from(actorId),
            action: "DELETE",
            entityType: "Attachment",
            entityId: attachmentId,
            changes: { deletedAt: { from: null, to: occurredAt } },
        }, occurredAt)

        await this.auditRepository.save(audit)
    }
}
