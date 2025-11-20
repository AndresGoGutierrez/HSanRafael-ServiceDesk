import type { Request, Response } from "express"
import type { ConfigureWorkflowUseCase } from "../../application/use-cases/ConfigureWorkflowUseCase"
import { WorkflowMapper } from "../../infrastructure/repositories/PrismaWorkflowRepository"

/**
 * HTTP controller responsible for handling operations
 * related to workflow configuration.
 *
 * It belongs to the interface layer (delivery) and acts as an
 * adapter between the HTTP world and the domain.
 */
export class WorkflowController {
    constructor(private readonly configureWorkflowUseCase: ConfigureWorkflowUseCase) { }

    /**
     * Configures or updates the workflow associated with an area.
     * 
     * Endpoint: **PUT /areas/:id/workflow**
     *
     * Requires authentication (actor extracted from the JWT token).
     */
    async configureWorkflow(req: Request, res: Response): Promise<void> {
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

            // Mandatory parameter validation
            if (!areaId) {
                res.status(400).json({
                    success: false,
                    error: "El parámetro 'id' (areaId) es obligatorio.",
                })
                return
            }

            // Use case execution
            const workflow = await this.configureWorkflowUseCase.execute(areaId, req.body, actorId)

            // Successful response
            res.status(200).json({
                success: true,
                message: "Workflow configurado exitosamente.",
                data: WorkflowMapper.toResponse(workflow),
            })
        } catch (error) {
            // Contextual logging for debugging
            console.error("[WorkflowController] Error al configurar workflow:", error)

            // Controlled error response
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "Error interno al configurar el workflow.",
            })
        }
    }
}