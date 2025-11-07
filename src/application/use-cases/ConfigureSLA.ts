import type { AreaRepository } from "../ports/AreaRepository"
import { type UpdateSLAInput, UpdateSLASchema } from "../dtos/area"
import type { Area } from "../../domain/entities/Area"

/**
 * Caso de uso: Configurar los tiempos de SLA (Service Level Agreement) de un área.
 * - Valida los datos de entrada con Zod.
 * - Recupera la entidad `Area` desde el repositorio.
 * - Actualiza su configuración de SLA.
 * - Persiste los cambios.
 */
export class ConfigureSLA {
  constructor(private readonly repo: AreaRepository) {}

  /**
   * Ejecuta el caso de uso de configuración de SLA.
   * @param areaId Identificador único del área a modificar.
   * @param input Datos de configuración de SLA (response/resolution minutes).
   * @returns La entidad `Area` actualizada.
   */
  async execute(areaId: string, input: UpdateSLAInput): Promise<Area> {
    const validated = UpdateSLASchema.parse(input)

    const area = await this.repo.findById(areaId)
    if (!area) {
      throw new Error(`Area with id "${areaId}" not found`)
    }

    area.configureSLA(validated)
    await this.repo.save(area)

    return area
  }
}
