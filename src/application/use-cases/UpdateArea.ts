import type { AreaRepository } from "../ports/AreaRepository"
import type { EventBus } from "../ports/EventBus"
import { UpdateAreaSchema, type UpdateAreaInput } from "../dtos/area"
import type { Area } from "../../domain/entities/Area"

/**
 * Use case: update data for an existing area.
 * Apply validations, update the entity, and publish domain events.
 */
export class UpdateArea {
  constructor(
    private readonly repo: AreaRepository,
    private readonly bus: EventBus,
  ) {}

  /**
   * Executes the update of an area.
   * @param id Identifier of the entity to be updated.
   * @param input Validated data for the area.
   * @returns The updated `Area` entity.
   */
  async execute(id: string, input: UpdateAreaInput): Promise<Area> {
    // Validate input with Zod
    const validated = UpdateAreaSchema.parse(input)

    // Search for existing entity
    const area = await this.repo.findById(id.trim())
    if (!area) {
      throw new Error(`No se encontró un área con el ID "${id}".`)
    }

    // Validar duplicados por nombre
    const existingByName = await this.repo.findByName(validated.name.trim())
    if (existingByName && existingByName.id.toString() !== area.id.toString()) {
      throw new Error(`Ya existe un área con el nombre "${validated.name}".`)
    }

    // Update domain entity
    area.update(validated.name, validated.description)

    // Save to repository
    await this.repo.save(area)

    // Publish domain events if they exist
    const events = area.pullDomainEvents()
    if (events.length > 0) {
      await this.bus.publishAll(events)
    }

    return area
  }
}
