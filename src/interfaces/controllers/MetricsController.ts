import type { Request, Response } from "express"
import type { ComputeSLAMetrics } from "../../application/use-cases/ComputeSLAMetrics"
import { MetricsQuerySchema } from "../../application/dtos/metrics"
import { ZodError } from "zod"

/**
 * Controller responsible for handling requests related to SLA metrics.
 *
 * Belongs to the infrastructure layer (interface adapters),
 * and delegates business logic to the `ComputeSLAMetrics` use case.
 */
export class MetricsController {
    constructor(private readonly computeSLAMetrics: ComputeSLAMetrics) { }

    /**
     * Gets SLA metrics based on query parameters.
     * 
     * GET /metrics/sla
     */
    async getSLAMetrics(req: Request, res: Response): Promise<void> {
        try {
            // Validate query params
            const query = MetricsQuerySchema.parse(req.query)

            // Run the use case
            const metrics = await this.computeSLAMetrics.execute(query)

            // Respond successfully
            res.status(200).json({
                success: true,
                message: "Métricas de SLA calculadas correctamente",
                data: metrics,
            })
        } catch (error) {
            // Zod schema validation
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: "Parámetros de consulta inválidos",
                    details: error.issues.map(issue => issue.message),
                })
                return
            }

            // Controlled application errors
            if (error instanceof Error) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                })
                return
            }

            // Unexpected errors
            console.error("[MetricsController] Error inesperado:", error)
            res.status(500).json({
                success: false,
                error: "Error interno del servidor",
            })
        }
    }
}
