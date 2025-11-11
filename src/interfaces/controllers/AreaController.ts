import type { Request, Response } from "express"
import type { CreateArea } from "../../application/use-cases/CreateArea"
import type { UpdateArea } from "../../application/use-cases/UpdateArea"
import type { ListAreas } from "../../application/use-cases/ListArea"
import type { DeactivateArea } from "../../application/use-cases/DeactivateArea"
import type { ListTicketsByAreaUseCase } from "../../application/use-cases/ListTicketsByAreaUseCase"

import { TicketMapper } from "../mappers/TicketMapper"


/**
 * Controlador HTTP para gestionar las áreas del sistema.
 * Actúa como adaptador entre la capa de infraestructura (Express)
 * y la capa de aplicación (casos de uso).
 */
export class AreaController {
  constructor(
    private readonly createArea: CreateArea,
    private readonly updateArea: UpdateArea,
    private readonly listAreas: ListAreas,
    private readonly deactivateArea: DeactivateArea,
    private readonly listTicketsByAreaUseCase?: ListTicketsByAreaUseCase,
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

  /**
   * Lista los tickets asociados a un área específica. (GET /areas/:id/tickets)
   */
  async listByArea(req: Request, res: Response): Promise<void> {
    try {
      if (!this.listTicketsByAreaUseCase) {
        res.status(501).json({
          success: false,
          error: "Feature not implemented",
        })
        return
      }

      const { id: areaId } = req.params
      const { from, to } = req.query

      const filters = {
        from: from ? new Date(from as string) : undefined,
        to: to ? new Date(to as string) : undefined,
      }

      const tickets = await this.listTicketsByAreaUseCase.execute(areaId, filters)

      res.status(200).json({
        success: true,
        message: "Tickets del área obtenidos correctamente",
        data: tickets.map(TicketMapper.toHttp),
        count: tickets.length,
      })
    } catch (error) {
      this.handleError(res, error, "Error al obtener tickets")
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

  /** Manejo directo de errores en métodos no basados en handle(). */
  private handleError(res: Response, error: unknown, message: string): void {
    console.error("[AreaController] Error:", error)
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : message,
    })
  }

}
