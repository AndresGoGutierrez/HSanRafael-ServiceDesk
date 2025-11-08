import { type Request, type Response } from "express"
import type { CommentController } from "../../controllers/CommentController"
import type { BaseMiddleware } from "../middlewares/validate"
import { BaseRouter } from "../base/BaseRouter"
import { CreateCommentSchema } from "../../../application/dtos/comment"

/**
 * Router HTTP encargado de manejar las rutas relacionadas con los comentarios de tickets.
 *
 * Forma parte de la capa de infraestructura, actuando como adaptador de transporte.
 */
export class CommentRouter extends BaseRouter<CommentController, BaseMiddleware> {
    constructor(controller: CommentController, middleware: BaseMiddleware) {
        super(controller, middleware)
    }

    /**
     * Define las rutas del recurso Comment.
     * Aplica validación y delega la lógica de negocio al controlador.
     */
    protected routes(): void {
        /**
         * @swagger
         * /tickets/{ticketId}/comments:
         *   post:
         *     summary: Crea un nuevo comentario en un ticket
         *     tags: [Comments]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: ticketId
         *         required: true
         *         schema:
         *           type: string
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/CreateComment'
         *     responses:
         *       201:
         *         description: Comentario creado correctamente
         *       400:
         *         description: Datos inválidos
         *       401:
         *         description: No autorizado
         */
        this.router.post(
            "/tickets/:ticketId/comments",
            this.middleware.validate("body", CreateCommentSchema),
            this.safeHandler((req, res) => this.controller.create(req, res)),
        )

        /**
         * @swagger
         * /tickets/{ticketId}/comments:
         *   get:
         *     summary: Lista los comentarios asociados a un ticket
         *     tags: [Comments]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: ticketId
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Lista de comentarios obtenida exitosamente
         *       400:
         *         description: Error en la solicitud
         *       401:
         *         description: No autorizado
         */
        this.router.get(
            "/tickets/:ticketId/comments",
            this.safeHandler((req, res) => this.controller.listByTicket(req, res)),
        )
    }

    /**
     * Envuelve los controladores en un manejador seguro para capturar errores no controlados.
     */
    private safeHandler(
        handler: (req: Request, res: Response) => Promise<void> | void,
    ) {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                await handler(req, res)
            } catch (error) {
                console.error("[CommentRouter] Unhandled error:", error)
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : "Internal server error",
                })
            }
        }
    }
}
