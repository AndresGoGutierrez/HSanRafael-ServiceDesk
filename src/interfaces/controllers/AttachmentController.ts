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
            const file = req.file
            if (!file) {
                res.status(400).json({ error: "No se ha proporcionado ningún archivo" })
                return
            }

            const uploaderId = (req as any).user?.userId
            if (!uploaderId) {
                res.status(401).json({ error: "Usuario no autenticado" })
                return
            }

            const baseUrl = `${req.protocol}://${req.get("host")}`

            const attachmentData = {
                ticketId: req.params.ticketId,
                uploaderId,
                filename: file.originalname,
                contentType: file.mimetype,
                size: file.size,
                url: `${baseUrl}/uploads/${file.filename}`, // o el path real si usas almacenamiento externo
            }

            const attachment = await this.addAttachment.execute(attachmentData)

            res.status(201).json({
                success: true,
                message: "Archivo adjunto agregado correctamente",
                data: attachment,
            })
        } catch (error) {
            console.error("[AttachmentController] Error en create:", error)
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
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
            const actorId = (req as any).user?.userId || "system"

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
