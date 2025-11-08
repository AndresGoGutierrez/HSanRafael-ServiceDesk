import { Router, type Request, type Response } from "express"
import type { BaseMiddleware } from "../middlewares/validate"
import { BaseRouter } from "../base/BaseRouter"
import type { TicketController } from "../../controllers/TicketController"
import type { AuthMiddleware } from "../middlewares/auth.middleware"
import {
    CreateTicketSchema,
    AssignTicketSchema,
    TransitionTicketSchema,
} from "../../../application/dtos/ticket"

/**
 * Router HTTP encargado de definir las rutas relacionadas con la gestión de tickets.
 * 
 * Sigue los principios de Clean Architecture:
 * - No contiene lógica de negocio.
 * - Delegación completa a controladores de aplicación.
 * - Aplica validaciones, autenticación y autorización a nivel de capa de infraestructura.
 */
export class TicketsRouter extends BaseRouter<TicketController, BaseMiddleware> {
    constructor(
        controller: TicketController,
        middleware: BaseMiddleware,
        private authMiddleware: AuthMiddleware,
    ) {
        super(controller, middleware)
        this.routes()
    }

    /**
     * Define las rutas expuestas por el recurso "tickets".
     * Incluye validación, autenticación y control de roles.
     */
    protected routes(): void {
        const { authenticate, authorize } = this.authMiddleware

        /**
         * @swagger
         * /tickets:
         *   post:
         *     summary: Create a new ticket
         *     tags: [Tickets]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - title
         *               - priority
         *               - userId
         *               - areaId
         *             properties:
         *               title:
         *                 type: string
         *               priority:
         *                 type: string
         *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
         *               userId:
         *                 type: string
         *                 format: uuid
         *               areaId:
         *                 type: string
         *                 format: uuid
         *     responses:
         *       201:
         *         description: Ticket created successfully
         *       400:
         *         description: Validation error
         *       401:
         *         description: Unauthorized
         */
        this.router.post(
            "/",
            authenticate,
            this.middleware.validate("body", CreateTicketSchema),
            this.safeHandler((req, res) => this.controller.create(req, res)),
        )

        /**
         * @swagger
         * /tickets:
         *   get:
         *     summary: List all tickets
         *     tags: [Tickets]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: List of tickets
         *       401:
         *         description: Unauthorized
         */
        this.router.get(
            "/",
            authenticate,
            this.safeHandler((req, res) => this.controller.list(req, res)),
        )

        /**
         * @swagger
         * /tickets/{id}:
         *   get:
         *     summary: Get ticket by ID
         *     tags: [Tickets]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *     responses:
         *       200:
         *         description: Ticket details
         *       404:
         *         description: Ticket not found
         *       401:
         *         description: Unauthorized
         */
        this.router.get(
            "/:id",
            authenticate,
            this.safeHandler((req, res) => this.controller.getById(req, res)),
        )

        /**
         * @swagger
         * /tickets/{id}/assign:
         *   post:
         *     summary: Assign ticket to an agent
         *     tags: [Tickets]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - assigneeId
         *             properties:
         *               assigneeId:
         *                 type: string
         *                 format: uuid
         *     responses:
         *       200:
         *         description: Ticket assigned successfully
         *       401:
         *         description: Unauthorized
         *       403:
         *         description: Forbidden
         */
        this.router.post(
            "/:id/assign",
            authenticate,
            authorize("ADMIN", "AGENT"),
            this.middleware.validate("body", AssignTicketSchema),
            this.safeHandler((req, res) => this.controller.assign(req, res)),
        )

        /**
         * @swagger
         * /tickets/{id}/transition:
         *   post:
         *     summary: Transition ticket status
         *     tags: [Tickets]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - status
         *             properties:
         *               status:
         *                 type: string
         *                 enum: [OPEN, IN_PROGRESS, PENDING, RESOLVED, CLOSED]
         *     responses:
         *       200:
         *         description: Status transitioned successfully
         *       401:
         *         description: Unauthorized
         *       403:
         *         description: Forbidden
         */
        this.router.post(
            "/:id/transition",
            authenticate,
            authorize("ADMIN", "AGENT", "TECH"),
            this.middleware.validate("body", TransitionTicketSchema),
            this.safeHandler((req, res) => this.controller.transition(req, res)),
        )
    }

    /**
     * Envuelve las rutas para manejar errores inesperados sin romper el servidor.
     * Mantiene un formato de respuesta consistente ante fallos.
     */
    private safeHandler(
        handler: (req: Request, res: Response) => Promise<void> | void,
    ) {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                await handler(req, res)
            } catch (error) {
                console.error("[TicketsRouter] Unhandled error:", error)
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : "Internal server error",
                })
            }
        }
    }
}
