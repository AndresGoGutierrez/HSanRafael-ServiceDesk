import { Ticket } from "../../domain/entities/Ticket"
import type { TicketRepository } from "../ports/TicketRepository"
import type { AreaRepository } from "../ports/AreaRepository"

/**
 * Caso de uso: Listar todos los tickets de un área específica.
 *
 * Responsabilidades:
 * - Verificar que el área exista.
 * - Filtrar tickets por área.
 * - Permitir filtros opcionales por rango de fechas.
 */
export class ListTicketsByAreaUseCase {
    constructor(
        private readonly ticketRepository: TicketRepository,
        private readonly areaRepository: AreaRepository,
    ) { }

    /**
     * Ejecuta el caso de uso.
     * @param areaId Identificador del área a consultar.
     * @param filters Filtros opcionales por rango de fechas.
     * @throws {AreaNotFoundError} Si el área no existe.
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
 * Excepción de dominio para cuando el área no existe.
 */
export class AreaNotFoundError extends Error {
    constructor(areaId: string) {
        super(`Área con ID "${areaId}" no encontrada`)
        this.name = "AreaNotFoundError"
    }
}
