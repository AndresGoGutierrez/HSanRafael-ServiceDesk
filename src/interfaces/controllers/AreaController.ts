import type { Request, Response } from "express"
import type { CreateArea } from "../../application/use-cases/CreateArea"
import type { UpdateArea } from "../../application/use-cases/UpdateArea"
import type { ListAreas } from "../../application/use-cases/ListArea"
import type { DeactivateArea } from "../../application/use-cases/DeactivateArea"
import type { ListTicketsByAreaUseCase } from "../../application/use-cases/ListTicketsByAreaUseCase"

import { TicketMapper } from "../mappers/TicketMapper"


/**
 * HTTP controller for managing system areas.
 * Acts as an adapter between the infrastructure layer (Express)
 * and the application layer (use cases).
 */
export class AreaController {
  constructor(
    private readonly createArea: CreateArea,
    private readonly updateArea: UpdateArea,
    private readonly listAreas: ListAreas,
    private readonly deactivateArea: DeactivateArea,
    private readonly listTicketsByAreaUseCase?: ListTicketsByAreaUseCase,
  ) { }

  /** Create a new area. (POST /areas) */
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

  /** Updates an existing area. (PUT /areas/:id) */
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


  /** Lists all areas. (GET /areas) */
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
   * Deactivates an area. (PATCH /areas/:id/deactivate)
   * 
   * This endpoint:
   * - Verifies that the area has no active tickets.
   * - Deactivates the area from the domain.
   * - Logs the action in the audit.
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
   * Lists tickets associated with a specific area. (GET /areas/:id/tickets)
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


  /** Centralized error handling. */
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

  /** Direct error handling in methods not based on handle(). */
  private handleError(res: Response, error: unknown, message: string): void {
    console.error("[AreaController] Error:", error)
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : message,
    })
  }

}
