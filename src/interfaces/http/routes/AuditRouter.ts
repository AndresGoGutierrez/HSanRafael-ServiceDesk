import { Router, type Request, type Response } from "express"
import type { AuditController } from "../../controllers/AuditController"
import type { AuthMiddleware } from "../middlewares/auth.middleware"

/**
 * HTTP router responsible for routes related to ticket auditing.
 *
 * Orchestrates the flow between:
 *  - Authentication/authorization middleware.
 *  - Controllers that coordinate use cases.
 * 
 */
export class AuditRouter {
    private readonly router: Router

    constructor(
        private readonly controller: AuditController,
        private authMiddleware: AuthMiddleware,
    ) {
        this.router = Router()
        this.initializeRoutes()
    }

    /**
     * Initializes audit trails.
     */
    private initializeRoutes(): void {

        const { authenticate, authorize } = this.authMiddleware
        /**
         * GET /tickets/:ticketId/audit
         * Obtiene el historial de auditoría asociado a un ticket.
         * 
         * @swagger
         * /tickets/{ticketId}/audit:
         *   get:
         *     summary: Obtiene el historial de auditoría de un ticket.
         *     tags: [Audit]
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
         *         description: Historial de auditoría obtenido correctamente.
         *       401:
         *         description: No autorizado.
         *       404:
         *         description: Ticket no encontrado.
         */
        this.router.get(
            "/tickets/:ticketId/audit",
            authenticate,
            authorize("ADMIN", "AGENT", "TECH"),
            this.safeHandler((req, res) => this.controller.getTicketAudit(req, res)),
        )
    }

    /**
     * Returns the router configured for use in the infrastructure layer (Express).
     */
    public getRouter(): Router {
        return this.router
    }

    /**
     * Security wrapper to prevent unhandled errors.
     * Ensures that all routes handle exceptions correctly.
     */
    private safeHandler(
        handler: (req: Request, res: Response) => Promise<void> | void,
    ) {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                await handler(req, res)
            } catch (error) {
                console.error("[AuditRouter] Unhandled error:", error)
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : "Internal server error",
                })
            }
        }
    }
}
