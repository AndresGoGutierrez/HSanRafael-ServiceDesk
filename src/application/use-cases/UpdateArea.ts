import type { AreaRepository } from "../ports/AreaRepository"
import type { EventBus } from "../ports/EventBus"
import { UpdateAreaSchema, type UpdateAreaInput } from "../dtos/area"
import type { Area } from "../../domain/entities/Area"

/**
 * Caso de uso: actualizar los datos de un área existente.
 * Aplica validaciones, actualiza la entidad y publica eventos de dominio.
 */
export class UpdateArea {
  constructor(
    private readonly repo: AreaRepository,
    private readonly bus: EventBus,
  ) {}

  /**
   * Ejecuta la actualización de un área.
   * @param id Identificador de la entidad a actualizar.
   * @param input Datos validados del área.
   * @returns La entidad `Area` actualizada.
   */
  async execute(id: string, input: UpdateAreaInput): Promise<Area> {
    // Validar input con Zod
    const validated = UpdateAreaSchema.parse(input)

    // Buscar la entidad existente
    const area = await this.repo.findById(id.trim())
    if (!area) {
      throw new Error(`No se encontró un área con el ID "${id}".`)
    }

    // Validar duplicados por nombre (opcional pero recomendado)
    const existingByName = await this.repo.findByName(validated.name.trim())
    if (existingByName && existingByName.id.toString() !== area.id.toString()) {
      throw new Error(`Ya existe un área con el nombre "${validated.name}".`)
    }

    // ✅ Actualizar entidad del dominio
    area.update(validated.name, validated.description)

    // ✅ Guardar en repositorio
    await this.repo.save(area)

    // ✅ Publicar eventos de dominio si existen
    const events = area.pullDomainEvents()
    if (events.length > 0) {
      await this.bus.publishAll(events)
    }

    return area
  }
}
