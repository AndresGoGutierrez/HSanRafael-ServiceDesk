import { Ticket } from "../../domain/entities/Ticket"
import type { TicketRepository } from "../ports/TicketRepository"
import type { AreaRepository } from "../ports/AreaRepository"

/**
 * Use case: List all tickets in a specific area.
 *
 * Responsibilities:
 * - Verify that the area exists.
 * - Filter tickets by area.
 * - Allow optional filters by date range.
 */
export class ListTicketsByAreaUseCase {
    constructor(
        private readonly ticketRepository: TicketRepository,
        private readonly areaRepository: AreaRepository,
    ) { }

    /**
     * Executes the use case.
     * @param areaId Identifier of the area to be queried.
     * @param filters Optional filters by date range.
     * @throws {AreaNotFoundError} If the area does not exist.
     */
    async execute(
        areaId: string,
        filters?: { from?: Date; to?: Date },
    ): Promise<Ticket[]> {
        const area = await this.areaRepository.findById(areaId)
        if (!area) {
            throw new AreaNotFoundError(areaId)
        }

        return this.ticketRepository.findByFilters({
            areaId,
            from: filters?.from,
            to: filters?.to,
        })
    }
}

/**
 * Domain exception for when the area does not exist.
 */
export class AreaNotFoundError extends Error {
    constructor(areaId: string) {
        super(`Área con ID "${areaId}" no encontrada`)
        this.name = "AreaNotFoundError"
    }
}
