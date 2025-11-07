import type { Request, Response } from "express"
import type { CreateArea } from "../../application/use-cases/CreateArea"
import type { UpdateArea } from "../../application/use-cases/UpdateArea"
import type { ConfigureSLA } from "../../application/use-cases/ConfigureSLA"
import type { ListAreas } from "../../application/use-cases/ListArea"

/**
 * Controlador HTTP para gestionar las áreas del sistema.
 * Implementa operaciones CRUD a través de casos de uso de la capa de aplicación.
 */
export class AreaController {
  constructor(
    private readonly createArea: CreateArea,
    private readonly updateArea: UpdateArea,
    private readonly configureSLA: ConfigureSLA,
    private readonly listAreas: ListAreas,
  ) {}

  /**
   * Maneja la creación de una nueva área.
   * POST /areas
   */
  async create(req: Request, res: Response): Promise<void> {
    await this.handle(res, async () => {
      const area = await this.createArea.execute(req.body)
      res.status(201).json(area)
    })
  }

  /**
   * Maneja la actualización de un área existente.
   * PUT /areas/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    await this.handle(res, async () => {
      const area = await this.updateArea.execute(req.params.id, req.body)
      res.status(200).json(area)
    })
  }

  /**
   * Configura los SLA de un área.
   * PATCH /areas/:id/sla
   */
  async updateSLA(req: Request, res: Response): Promise<void> {
    await this.handle(res, async () => {
      const area = await this.configureSLA.execute(req.params.id, req.body)
      res.status(200).json(area)
    })
  }

  /**
   * Lista todas las áreas.
   * GET /areas
   */
  async list(req: Request, res: Response): Promise<void> {
    await this.handle(res, async () => {
      const areas = await this.listAreas.execute()
      res.status(200).json(areas)
    })
  }

  /**
   * Método auxiliar para manejo centralizado de errores.
   * Evita duplicar lógica try/catch.
   */
  private async handle(res: Response, action: () => Promise<void>): Promise<void> {
    try {
      await action()
    } catch (error) {
      console.error("[AreaController] Error:", error)
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
}
