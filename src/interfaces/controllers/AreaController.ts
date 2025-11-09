import type { Request, Response } from "express"
import type { CreateArea } from "../../application/use-cases/CreateArea"
import type { UpdateArea } from "../../application/use-cases/UpdateArea"
import type { ConfigureSLA } from "../../application/use-cases/ConfigureSLA"
import type { ListAreas } from "../../application/use-cases/ListArea"
import type { DeactivateArea } from "../../application/use-cases/DeactivateArea"
import type { ConfigureWorkflow } from "../../application/use-cases/ConfigureWorkflow"
import { WorkflowConfig } from "../../application/dtos/area"

/**
 * Controlador HTTP para gestionar las áreas del sistema.
 * Actúa como adaptador entre la capa de infraestructura (Express)
 * y la capa de aplicación (casos de uso).
 */
export class AreaController {
  constructor(
    private readonly createArea: CreateArea,
    private readonly updateArea: UpdateArea,
    private readonly configureSLA: ConfigureSLA,
    private readonly listAreas: ListAreas,
    private readonly deactivateArea: DeactivateArea,
    private readonly configureWorkflowUseCase: ConfigureWorkflow,
  ) { }

  /** Crea una nueva área. (POST /areas) */
  async create(req: Request, res: Response): Promise<void> {
    await this.handle(res, async () => {
      const area = await this.createArea.execute(req.body)
      res.status(201).json({
        success: true,
        message: "Área creada exitosamente",
        data: area,
      })
    })
  }

  /** Actualiza un área existente. (PUT /areas/:id) */
  async update(req: Request, res: Response): Promise<void> {
    await this.handle(res, async () => {
      const area = await this.updateArea.execute(req.params.id, req.body)
      res.status(200).json({
        success: true,
        message: "Área actualizada correctamente",
        data: area,
      })
    })
  }

  /** Configura los SLA de un área. (PATCH /areas/:id/sla) */
  async updateSLA(req: Request, res: Response): Promise<void> {
    await this.handle(res, async () => {
      const area = await this.configureSLA.execute(req.params.id, req.body)
      res.status(200).json({
        success: true,
        message: "SLA configurado correctamente",
        data: area,
      })
    })
  }

  /** Lista todas las áreas. (GET /areas) */
  async list(_: Request, res: Response): Promise<void> {
    await this.handle(res, async () => {
      const areas = await this.listAreas.execute()
      res.status(200).json({
        success: true,
        message: "Áreas obtenidas correctamente",
        data: areas,
      })
    })
  }

  /**
   * Desactiva un área. (PATCH /areas/:id/deactivate)
   * 
   * Este endpoint:
   * - Verifica que el área no tenga tickets activos.
   * - Desactiva el área desde el dominio.
   * - Registra la acción en la auditoría.
   */
  async deactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { reason } = req.body
      const actorId = (req as any).user?.userId

      if (!actorId) {
        res.status(401).json({
          success: false,
          error: "No se encontró el usuario autenticado",
        })
        return
      }

      await this.deactivateArea.execute(id, actorId, reason)

      res.status(200).json({
        success: true,
        message: "Área desactivada exitosamente",
      })
    } catch (error) {
      console.error("[AreaController] Error:", error)
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Error al desactivar el área",
      })
    }
  }

  /** Configura el workflow de un área. (PATCH /areas/:id/workflow) */
  async configureWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const config = req.body as WorkflowConfig
      const actorId = (req as any).user?.userId // <- igual que en deactivate

      if (!actorId) {
        res.status(401).json({
          success: false,
          error: "No se encontró el usuario autenticado",
        })
        return
      }

      await this.configureWorkflowUseCase.execute(id, config, actorId)

      res.status(200).json({
        success: true,
        message: "Workflow configurado exitosamente",
        data: config,
      })
    } catch (error) {
      console.error("[AreaController] Error al configurar workflow:", error)
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al configurar el workflow",
      })
    }
  }

  /** Manejo centralizado de errores. */
  private async handle(res: Response, action: () => Promise<void>): Promise<void> {
    try {
      await action()
    } catch (error) {
      console.error("[AreaController] Error:", error)
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
}
