import type { Request, Response } from "express"
import type { AddAttachment } from "../../application/use-cases/AddAttachment"
import type { ListAttachmentsByTicket } from "../../application/use-cases/ListAttachmentsByTicket"

export class AttachmentController {
    constructor(
        private readonly addAttachment: AddAttachment,
        private readonly listAttachmentsByTicket: ListAttachmentsByTicket,
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
}
