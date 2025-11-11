import type { Request, Response } from "express"
import type { AddComment } from "../../application/use-cases/AddComment"
import type { ListCommentsByTicket } from "../../application/use-cases/ListCommentsByTicket"

/**
 * Controlador responsable de manejar operaciones relacionadas con comentarios.
 * 
 * Pertenece a la capa de interfaz (controllers) y delega la lógica
 * de negocio a los casos de uso `AddComment` y `ListCommentsByTicket`.
 */
export class CommentController {
    constructor(
        private readonly addComment: AddComment,
        private readonly listCommentsByTicket: ListCommentsByTicket,
    ) { }

    /**
     * Crea un nuevo comentario asociado a un ticket.
     * POST /tickets/:ticketId/comments
     */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { ticketId } = req.params
            const { body, isInternal } = req.body
            const authorId = (req as any).user?.userId

            if (!ticketId) {
                res.status(400).json({ success: false, error: "El ID del ticket es obligatorio" })
                return
            }

            if (!authorId) {
                res.status(401).json({ success: false, error: "Usuario no autenticado" })
                return
            }

            const internalFlag =
                isInternal === true || isInternal === "true"
                    ? true
                    : isInternal === false || isInternal === "false"
                        ? false
                        : undefined

            if (internalFlag === undefined) {
                res.status(400).json({ success: false, error: "El campo 'isInternal' debe ser true o false" })
                return
            }

            const comment = await this.addComment.execute({
                ticketId,
                authorId,
                body,
                isInternal: internalFlag,
            })

            res.status(201).json({
                success: true,
                message: "Comentario creado correctamente",
                data: comment,
            })
        } catch (error) {
            console.error("[CommentController] Error al crear comentario:", error)
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
            })
        }
    }

    /**
     * Lista los comentarios asociados a un ticket específico.
     * GET /tickets/:ticketId/comments
     */
    async listByTicket(req: Request, res: Response): Promise<void> {
        try {
            const { ticketId } = req.params
            if (!ticketId) {
                res.status(400).json({ success: false, error: "El ID del ticket es obligatorio" })
                return
            }

            const comments = await this.listCommentsByTicket.execute(ticketId)

            res.status(200).json({
                success: true,
                message: "Comentarios obtenidos correctamente",
                data: comments,
            })
        } catch (error) {
            console.error("[CommentController] Error al listar comentarios:", error)

            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
            })
        }
    }
}
