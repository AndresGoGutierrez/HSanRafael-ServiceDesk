import { type Request, type Response } from "express"
import type { CommentController } from "../../controllers/CommentController"
import type { BaseMiddleware } from "../middlewares/validate"
import { BaseRouter } from "../base/BaseRouter"
import { CreateCommentSchema } from "../../../application/dtos/comment"
import type { AuthMiddleware } from "../middlewares/auth.middleware"

/**
 * Router HTTP encargado de manejar las rutas relacionadas con los comentarios de tickets.
 *
 * Forma parte de la capa de infraestructura, actuando como adaptador de transporte.
 */
export class CommentRouter extends BaseRouter<CommentController, BaseMiddleware> {
    constructor(
        controller: CommentController, 
        middleware: BaseMiddleware,
        private authMiddleware: AuthMiddleware,
    ) {
        super(controller, middleware)
        this.routes()
    }

    /**
     * Define las rutas del recurso Comment.
     * Aplica validación y delega la lógica de negocio al controlador.
     */
    protected routes(): void {
        const { authenticate, authorize } = this.authMiddleware
        /**
         * @swagger
         * /tickets/{ticketId}/comments:
         *   post:
         *     summary: Crea un nuevo comentario en un ticket
         *     description: >
         *       Permite registrar un **nuevo comentario** asociado a un ticket existente dentro del sistema.  
         *       - Solo los usuarios **autenticados** pueden agregar comentarios.  
         *       - El comentario puede ser **público** o **interno**, según el valor de `isInternal`.
         *     tags: [Comments]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: ticketId
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *         description: Identificador único del ticket al cual se asocia el comentario.
         *     requestBody:
         *       required: true
         *       content:
         *         application/x-www-form-urlencoded:
         *           schema:
         *             type: object
         *             required:
         *               - authorId
         *               - body
         *               - isInternal
         *             properties:
         *               authorId:
         *                 type: string
         *                 format: uuid
         *                 description: Identificador único del usuario que crea el comentario.
         *                 example: ""
         *               body:
         *                 type: string
         *                 description: Contenido del comentario escrito por el usuario.
         *                 example: ""
         *               isInternal:
         *                 type: boolean
         *                 enum: [true, false]
         *                 description: >
         *                   Define si el comentario es **interno** (visible solo para el personal autorizado)  
         *                   o **público** (visible para todos los usuarios relacionados con el ticket).
         *                 example: false
         *     responses:
         *       201:
         *         description: Comentario creado correctamente
         *         content:
         *           application/json:
         *             example:
         *               success: true
         *               message: "Comentario creado correctamente"
         *               data:
         *                 id: ""
         *                 ticketId: ""
         *                 authorId: ""
         *                 body: ""
         *                 isInternal: false
         *                 createdAt: ""
         *       400:
         *         description: Datos inválidos — el cuerpo del comentario o el ID del ticket no son válidos.
         *       401:
         *         description: No autorizado — el usuario no tiene un token de acceso válido.
         *       403:
         *         description: Prohibido — el usuario no tiene permisos para comentar en este ticket.
         */
        this.router.post(
            "/tickets/:ticketId/comments",
            authenticate,
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
            authenticate,
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
