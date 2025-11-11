import type { Request, Response } from "express"
import type { ConfigureWorkflowUseCase } from "../../application/use-cases/ConfigureWorkflowUseCase"
import { WorkflowMapper } from "../../infrastructure/repositories/PrismaWorkflowRepository"

/**
 * Controlador HTTP responsable de manejar las operaciones
 * relacionadas con la configuración de workflows.
 *
 * Pertenece a la capa de interfaz (delivery) y actúa como
 * adaptador entre el mundo HTTP y el dominio.
 */
export class WorkflowController {
    constructor(private readonly configureWorkflowUseCase: ConfigureWorkflowUseCase) { }

    /**
     * Configura o actualiza el workflow asociado a un área.
     * 
     * Endpoint: **PUT /areas/:id/workflow**
     *
     * Requiere autenticación (actor extraído del token JWT).
     */
    async configureWorkflow(req: Request, res: Response): Promise<void> {
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

            // Validación de parámetro obligatorio
            if (!areaId) {
                res.status(400).json({
                    success: false,
                    error: "El parámetro 'id' (areaId) es obligatorio.",
                })
                return
            }

            // Ejecución del caso de uso
            const workflow = await this.configureWorkflowUseCase.execute(areaId, req.body, actorId)

            // Respuesta exitosa
            res.status(200).json({
                success: true,
                message: "Workflow configurado exitosamente.",
                data: WorkflowMapper.toResponse(workflow),
            })
        } catch (error) {
            // Logging con contexto para depuración
            console.error("[WorkflowController] Error al configurar workflow:", error)

            // Respuesta de error controlada
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "Error interno al configurar el workflow.",
            })
        }
    }
}