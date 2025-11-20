import type { Request, Response } from "express"
import type { ConfigureSLAUseCase } from "../../application/use-cases/ConfigureSLAUseCase"
import { SLAMapper } from "../../infrastructure/repositories/PrismaSLARepository"

/**
 * HTTP controller responsible for handling operations related to SLAs.
 *
 * It is part of the interface layer (delivery) and communicates exclusively
 * with domain use cases, without depending on infrastructure details.
 */
export class SLAController {
    constructor(
        private readonly configureSLAUseCase: ConfigureSLAUseCase
    ) { }

    /**
     * Configures or updates the SLA associated with an area.
     * 
     * Endpoint: **POST /areas/:id/sla**
     *
     * Requires authentication. The `actorId` is extracted from the user token.
     */
    async configureSLA(req: Request, res: Response): Promise<void> {
        try {
            const areaId = req.params.id
            const actorId = (req as any)?.user?.userId as string | undefined

            // Authentication validation
            if (!actorId) {
                res.status(401).json({
                    success: false,
                    error: "Usuario no autenticado o token inválido.",
                })
                return
            }

            // Validation of required parameters
            if (!areaId) {
                res.status(400).json({
                    success: false,
                    error: "El parámetro 'id' (areaId) es obligatorio.",
                })
                return
            }

            // Use case execution
            const sla = await this.configureSLAUseCase.execute(areaId, req.body, actorId)

            res.status(200).json({
                success: true,
                message: "SLA configurado exitosamente.",
                data: SLAMapper.toResponse(sla),
            })
        } catch (error) {
            // Controlled logging and error handling
            console.error("[SLAController] Error al configurar SLA:", error)

            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "Error inesperado al configurar el SLA.",
            })
        }
    }
}
