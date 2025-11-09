import { Router, type Request, type Response } from "express"
import type { BaseMiddleware } from "../middlewares/validate"
import { BaseRouter } from "../base/BaseRouter"
import type { TicketController } from "../../controllers/TicketController"
import type { AuthMiddleware } from "../middlewares/auth.middleware"
import {
    CreateTicketSchema,
    AssignTicketSchema,
    TransitionTicketSchema,
    CloseTicketSchema
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
         *     summary: Crea un nuevo ticket de soporte
         *     description: >
         *       Permite registrar un **nuevo ticket** dentro del sistema para reportar incidentes o solicitudes.  
         *       - Solo los usuarios **autenticados** pueden crear tickets.  
         *       - El ticket queda asociado automáticamente al **usuario** y al **área** correspondiente.  
         *       - Los administradores y agentes también pueden crear tickets en nombre de otros usuarios.
         *     tags: [Tickets]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/x-www-form-urlencoded:
         *           schema:
         *             type: object
         *             required:
         *               - title
         *               - description
         *               - priority
         *               - userId
         *               - areaId
         *             properties:
         *               title:
         *                 type: string
         *                 description: Título o resumen breve del problema reportado
         *                 example: ""     # vacío por defecto (evita "string" en Swagger UI)
         *               description:
         *                 type: string
         *                 description: >
         *                   Descripción detallada del incidente o solicitud.
         *                 example: ""
         *               priority:
         *                 type: string
         *                 enum: [LOW, MEDIUM, HIGH, URGENT]
         *                 description: Nivel de prioridad asignado al ticket
         *                 default: "LOW"   # valor inicial por defecto
         *               userId:
         *                 type: string
         *                 format: uuid
         *                 description: ID del usuario que crea el ticket
         *                 example: ""      # sin valor por defecto
         *               areaId:
         *                 type: string
         *                 format: uuid
         *                 description: ID del área a la que pertenece el usuario o en la que se reporta el incidente
         *                 example: ""      # sin valor por defecto
         *     responses:
         *       201:
         *         description: Ticket creado correctamente
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 id:
         *                   type: string
         *                   format: uuid
         *                   example: "e91d7b8c-3b82-4c8a-9d1b-15f3e52e4579"
         *                 title:
         *                   type: string
         *                   example: "El equipo de rayos X no enciende"
         *                 description:
         *                   type: string
         *                   example: "No se proporcionó descripción"
         *                 priority:
         *                   type: string
         *                   example: "HIGH"
         *                 status:
         *                   type: string
         *                   example: "OPEN"
         *                 createdAt:
         *                   type: string
         *                   format: date-time
         *                   example: "2025-11-08T15:42:00Z"
         *       400:
         *         description: Error de validación o datos incompletos
         *       401:
         *         description: No autenticado
         *       403:
         *         description: No autorizado para crear tickets en nombre de otros usuarios
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

        /**
         * @swagger
         * /tickets/{id}/close:
         *   post:
         *     summary: Close a ticket with a resolution summary
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
         *               - resolutionSummary
         *             properties:
         *               resolutionSummary:
         *                 type: string
         *                 description: Detailed resolution summary of the ticket
         *                 example: "El problema fue solucionado actualizando el software del servidor."
         *               notifyRequester:
         *                 type: boolean
         *                 description: Whether to notify the requester upon closure
         *                 default: true
         *     responses:
         *       200:
         *         description: Ticket closed successfully
         *       400:
         *         description: Validation error
         *       401:
         *         description: Unauthorized
         *       403:
         *         description: Forbidden
         */
        this.router.post(
            "/:id/close",
            authenticate,
            authorize("ADMIN", "AGENT", "TECH"),
            this.middleware.validate("body", CloseTicketSchema),
            this.safeHandler((req, res) => this.controller.close(req, res)),
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
