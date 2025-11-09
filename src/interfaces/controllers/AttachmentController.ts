import type { Request, Response } from "express"
import type { AddAttachment } from "../../application/use-cases/AddAttachment"
import type { ListAttachmentsByTicket } from "../../application/use-cases/ListAttachmentsByTicket"
import type { DeleteAttachment } from "../../application/use-cases/DeleteAttachment"


export class AttachmentController {
    constructor(
        private readonly addAttachment: AddAttachment,
        private readonly listAttachmentsByTicket: ListAttachmentsByTicket,
        private readonly deleteAttachmentUseCase: DeleteAttachment,
    ) { }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const attachment = await this.addAttachment.execute({
                ...req.body,
                ticketId: req.params.ticketId,
            })
            res.status(201).json(attachment)
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message : "Unknown error",
            })
        }
    }

    async listByTicket(req: Request, res: Response): Promise<void> {
        try {
            const attachments = await this.listAttachmentsByTicket.execute(req.params.ticketId)
            res.status(200).json(attachments)
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message : "Unknown error",
            })
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { attachmentId } = req.params
            const actorId = (req as any).user?.id || "system"

            await this.deleteAttachmentUseCase.execute(attachmentId, actorId)

            res.status(204).send()
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : "Failed to delete attachment",
            })
        }
    }
}
