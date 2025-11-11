import type { Request, Response } from "express"
import type { ConfigureSLAUseCase } from "../../application/use-cases/ConfigureSLAUseCase"
import { SLAMapper } from "../../infrastructure/repositories/PrismaSLARepository"

/**
 * Controlador HTTP responsable de manejar las operaciones relacionadas con los SLA.
 *
 * Forma parte de la capa de interfaz (delivery) y se comunica exclusivamente
 * con casos de uso del dominio, sin depender de detalles de infraestructura.
 */
export class SLAController {
    constructor(
        private readonly configureSLAUseCase: ConfigureSLAUseCase
    ) { }

    /**
     * Configura o actualiza el SLA asociado a un área.
     * 
     * Endpoint: **POST /areas/:id/sla**
     *
     * Requiere autenticación. El `actorId` se extrae del token del usuario.
     */
    async configureSLA(req: Request, res: Response): Promise<void> {
        try {
            const areaId = req.params.id
            const actorId = (req as any)?.user?.userId as string | undefined

            // Validación de autenticación
            if (!actorId) {
                res.status(401).json({
                    success: false,
                    error: "Usuario no autenticado o token inválido.",
                })
                return
            }

            // Validación de parámetros requeridos
            if (!areaId) {
                res.status(400).json({
                    success: false,
                    error: "El parámetro 'id' (areaId) es obligatorio.",
                })
                return
            }

            // Ejecución del caso de uso
            const sla = await this.configureSLAUseCase.execute(areaId, req.body, actorId)

            // ✅ Respuesta exitosa
            res.status(200).json({
                success: true,
                message: "SLA configurado exitosamente.",
                data: SLAMapper.toResponse(sla),
            })
        } catch (error) {
            // Logging y manejo de errores controlado
            console.error("[SLAController] Error al configurar SLA:", error)

            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "Error inesperado al configurar el SLA.",
            })
        }
    }
}
