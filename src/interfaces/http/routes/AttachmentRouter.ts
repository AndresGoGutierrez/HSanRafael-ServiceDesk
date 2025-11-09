import type { Request, Response } from "express"
import type { AttachmentController } from "../../controllers/AttachmentController"
import type { BaseMiddleware } from "../middlewares/validate"
import { BaseRouter } from "../base/BaseRouter"
import { CreateAttachmentSchema } from "../../../application/dtos/attachment"
import type { AuthMiddleware } from "../middlewares/auth.middleware"

/**
 * Router HTTP para manejar las rutas relacionadas con los attachments.
 *
 * Esta clase orquesta el flujo entre:
 *  - Validación (middleware de infraestructura)
 *  - Controladores (capa interfaces/controllers)
 *  - Use Cases (capa de aplicación)
 *
 * ❗ Sin lógica de dominio aquí → se respeta Clean Architecture
 */
export class AttachmentRouter extends BaseRouter<AttachmentController, BaseMiddleware> {
    constructor(
        controller: AttachmentController, 
        middleware: BaseMiddleware,
        private authMiddleware: AuthMiddleware,
    ) {
        super(controller, middleware)
        this.routes()
    }

    protected routes(): void {

        const { authenticate, authorize } = this.authMiddleware

        /**
         * @swagger
         * /tickets/{ticketId}/attachments:
         *   post:
         *     summary: Adjunta un archivo a un ticket
         *     tags: [Attachments]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: ticketId
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *         description: ID del ticket al que se le adjuntará el archivo
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: "#/components/schemas/CreateAttachment"
         *     responses:
         *       201:
         *         description: Archivo adjunto creado correctamente
         *       400:
         *         description: Error de validación
         *       401:
         *         description: No autorizado
         *       500:
         *         description: Error interno del servidor
         */
        this.router.post(
            "/tickets/:ticketId/attachments",
            authenticate,
            this.middleware.validate("body", CreateAttachmentSchema),
            async (req: Request, res: Response) => {
                try {
                    await this.controller.create(req, res)
                } catch (error) {
                    console.error("[AttachmentRouter] Error en POST /tickets/:ticketId/attachments:", error)
                    res.status(500).json({
                        success: false,
                        error: error instanceof Error ? error.message : "Internal server error",
                    })
                }
            },
        )

        /**
         * @swagger
         * /tickets/{ticketId}/attachments:
         *   get:
         *     summary: Lista los archivos adjuntos de un ticket
         *     tags: [Attachments]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: ticketId
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *         description: ID del ticket del cual se obtendrán los adjuntos
         *     responses:
         *       200:
         *         description: Lista de archivos adjuntos
         *       401:
         *         description: No autorizado
         *       404:
         *         description: Ticket no encontrado
         *       500:
         *         description: Error interno del servidor
         */
        this.router.get(
            "/tickets/:ticketId/attachments",
            authenticate,
            async (req: Request, res: Response) => {
                try {
                    await this.controller.listByTicket(req, res)
                } catch (error) {
                    console.error("[AttachmentRouter] Error en GET /tickets/:ticketId/attachments:", error)
                    res.status(500).json({
                        success: false,
                        error: error instanceof Error ? error.message : "Internal server error",
                    })
                }
            },
        )


        /**
         * @swagger
         * /tickets/{ticketId}/attachments/{attachmentId}:
         *   delete:
         *     summary: Elimina (soft delete) un archivo adjunto de un ticket
         *     tags: [Attachments]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: ticketId
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *         description: ID del ticket asociado
         *       - in: path
         *         name: attachmentId
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *         description: ID del archivo adjunto a eliminar
         *     responses:
         *       204:
         *         description: Archivo adjunto eliminado correctamente
         *       400:
         *         description: Solicitud inválida o error de validación
         *       401:
         *         description: No autorizado
         *       404:
         *         description: Adjunto no encontrado
         *       500:
         *         description: Error interno del servidor
         */
        this.router.delete(
            "/tickets/:ticketId/attachments/:attachmentId",
            authenticate,
            authorize("ADMIN", "AGENT", "TECH"),
            async (req: Request, res: Response) => {
                try {
                    await this.controller.delete(req, res)
                } catch (error) {
                    console.error("[AttachmentRouter] Error en DELETE /tickets/:ticketId/attachments/:attachmentId:", error)
                    res.status(500).json({
                        success: false,
                        error: error instanceof Error ? error.message : "Internal server error",
                    })
                }
            },
        )
    }
}
