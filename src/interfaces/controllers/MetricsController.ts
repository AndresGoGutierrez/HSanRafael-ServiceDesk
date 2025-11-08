import type { Request, Response } from "express"
import type { ComputeSLAMetrics } from "../../application/use-cases/ComputeSLAMetrics"
import { MetricsQuerySchema } from "../../application/dtos/metrics"
import { ZodError } from "zod"

/**
 * Controlador encargado de manejar las solicitudes relacionadas con métricas de SLA.
 *
 * Pertenece a la capa de infraestructura (interface adapters),
 * y delega la lógica de negocio al caso de uso `ComputeSLAMetrics`.
 */
export class MetricsController {
    constructor(private readonly computeSLAMetrics: ComputeSLAMetrics) { }

    /**
     * Obtiene las métricas de SLA basadas en los parámetros de consulta.
     * 
     * GET /metrics/sla
     */
    async getSLAMetrics(req: Request, res: Response): Promise<void> {
        try {
            // Validar query params
            const query = MetricsQuerySchema.parse(req.query)

            // Ejecutar el caso de uso
            const metrics = await this.computeSLAMetrics.execute(query)

            // Responder con éxito
            res.status(200).json({
                success: true,
                message: "Métricas de SLA calculadas correctamente",
                data: metrics,
            })
        } catch (error) {
            // Validación de esquema Zod
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: "Parámetros de consulta inválidos",
                    details: error.issues.map(issue => issue.message),
                })
                return
            }

            // Errores controlados de aplicación
            if (error instanceof Error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                })
                return
            }

            // Errores inesperados
            console.error("[MetricsController] Error inesperado:", error)
            res.status(500).json({
                success: false,
                error: "Error interno del servidor",
            })
        }
    }
}
