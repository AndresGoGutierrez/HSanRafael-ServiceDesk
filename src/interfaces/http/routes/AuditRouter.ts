import { Router, type Request, type Response } from "express"
import type { AuditController } from "../../controllers/AuditController"
import type { AuthMiddleware } from "../middlewares/auth.middleware"

/**
 * Router HTTP responsable de las rutas relacionadas con la auditoría de tickets.
 *
 * Orquesta el flujo entre:
 *  - Middleware de autenticación/autorización.
 *  - Controladores que coordinan los casos de uso.
 * 
 * Cumple el rol de capa de infraestructura en Clean Architecture.
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
     * Inicializa las rutas de auditoría.
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
     * Devuelve el router configurado para ser usado en la capa de infraestructura (Express).
     */
    public getRouter(): Router {
        return this.router
    }

    /**
     * Envoltorio de seguridad para evitar errores no manejados.
     * Garantiza que todas las rutas manejen excepciones correctamente.
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
