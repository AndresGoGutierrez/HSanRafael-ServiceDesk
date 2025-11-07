import type { AreaRepository } from "../ports/AreaRepository"
import type { Clock } from "../ports/Clock"
import type { EventBus } from "../ports/EventBus"
import { Area } from "../../domain/entities/Area"
import { CreateAreaSchema, type CreateAreaInput } from "../dtos/area"

/**
 * Caso de uso: creación de un área.
 * Se encarga de validar la entrada, verificar duplicados, crear la entidad
 * y propagar eventos de dominio.
 */
export class CreateArea {
    constructor(
        private readonly repo: AreaRepository,
        private readonly clock: Clock,
        private readonly bus: EventBus,
    ) { }

    /**
     * Ejecuta el flujo de creación de un área.
     * @param input Datos de entrada validados mediante Zod.
     * @returns La entidad `Area` recién creada.
     */
    async execute(input: CreateAreaInput): Promise<Area> {
        // Validar input con esquema Zod (garantiza shape correcto)
        const validated = CreateAreaSchema.parse(input)

        // Verificar duplicado por nombre (case-insensitive opcional)
        const existing = await this.repo.findByName(validated.name.trim())
        if (existing) {
            throw new Error(`Ya existe un área con el nombre "${validated.name}".`)
        }

        // Crear la entidad del dominio
        const now = this.clock.now()
        const area = Area.create(validated, now)

        // Persistir entidad en el repositorio
        await this.repo.save(area)

        // Publicar eventos de dominio si los hay
        const events = area.pullDomainEvents()
        if (events.length > 0) {
            await this.bus.publishAll(events)
        }

        return area
    }
}
