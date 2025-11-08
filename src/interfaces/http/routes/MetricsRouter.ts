import { Router, type Request, type Response } from "express"
import type { MetricsController } from "../../controllers/MetricsController"
import type { AuthMiddleware } from "../middlewares/auth.middleware"

/**
 * Router HTTP responsable de exponer los endpoints de métricas del sistema.
 * Actúa como adaptador de transporte en la capa de infraestructura.
 */
export class MetricsRouter {
    private readonly router: Router

    constructor(
        private readonly controller: MetricsController,
        private readonly authMiddleware: AuthMiddleware,
    ) {
        this.router = Router()
        this.setupRoutes()
    }

    /**
     * Define las rutas disponibles para métricas del sistema.
     * Aplica autenticación, autorización y delega la lógica al controlador.
     */
    private setupRoutes(): void {
        /**
         * @swagger
         * /metrics/sla:
         *   get:
         *     summary: Obtiene métricas de cumplimiento de SLA
         *     tags: [Metrics]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: query
         *         name: areaId
         *         schema:
         *           type: string
         *         description: ID del área para filtrar las métricas
         *       - in: query
         *         name: from
         *         schema:
         *           type: string
         *           format: date-time
         *         description: Fecha de inicio del rango
         *       - in: query
         *         name: to
         *         schema:
         *           type: string
         *           format: date-time
         *         description: Fecha final del rango
         *     responses:
         *       200:
         *         description: Métricas de SLA obtenidas exitosamente
         *       400:
         *         description: Error en la solicitud
         *       401:
         *         description: No autorizado
         *       403:
         *         description: Permisos insuficientes
         */
        this.router.get(
            "/sla",
            this.authMiddleware.authenticate,
            this.authMiddleware.authorize("ADMIN", "AGENT"),
            this.safeHandler((req, res) => this.controller.getSLAMetrics(req, res)),
        )
    }

    /**
     * Manejador seguro que captura excepciones no controladas de los controladores.
     */
    private safeHandler(
        handler: (req: Request, res: Response) => Promise<void> | void,
    ) {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                await handler(req, res)
            } catch (error) {
                console.error("[MetricsRouter] Unhandled error:", error)
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : "Internal server error",
                })
            }
        }
    }

    /**
     * Devuelve el router configurado para su uso en la capa de infraestructura.
     */
    public getRouter(): Router {
        return this.router
    }
}
