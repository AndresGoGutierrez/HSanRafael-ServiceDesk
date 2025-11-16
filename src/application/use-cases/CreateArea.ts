import type { AreaRepository } from "../ports/AreaRepository"
import type { Clock } from "../ports/Clock"
import type { EventBus } from "../ports/EventBus"
import { Area } from "../../domain/entities/Area"
import { CreateAreaSchema, type CreateAreaInput } from "../dtos/area"

/**
 * Use case: creation of an area.
 * Responsible for validating input, checking for duplicates, creating the entity,
 * and propagating domain events.
 */
export class CreateArea {
    constructor(
        private readonly repo: AreaRepository,
        private readonly clock: Clock,
        private readonly bus: EventBus,
    ) { }

    /**
     * Executes the flow for creating an area.
     * @param input Input data validated by Zod.
     * @returns The newly created `Area` entity.
     */
    async execute(input: CreateAreaInput): Promise<Area> {
        // Validate input with Zod schema (ensures correct shape)
        const validated = CreateAreaSchema.parse(input)

        // Check for duplicate by name (case-insensitive optional)
        const existing = await this.repo.findByName(validated.name.trim())
        if (existing) {
            throw new Error(`Ya existe un área con el nombre "${validated.name}".`)
        }

        // Create the domain entity
        const now = this.clock.now()
        const area = Area.create(validated, now)

        // Persist entity in the repository
        await this.repo.save(area)

        // Publish domain events if any exist
        const events = area.pullDomainEvents()
        if (events.length > 0) {
            await this.bus.publishAll(events)
        }

        return area
    }
}
