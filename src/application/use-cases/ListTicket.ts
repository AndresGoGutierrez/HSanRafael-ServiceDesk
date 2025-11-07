import type { TicketRepository } from "../ports/TicketRepository"
import type { Ticket } from "../../domain/entities/Ticket"

/**
 * Caso de uso: listar todos los tickets del sistema.
 * Devuelve las entidades del dominio tal como las provee el repositorio.
 */
export class ListTickets {
  constructor(private readonly repo: TicketRepository) {}

  /**
   * Ejecuta la operación de listado.
   * Puede extenderse con filtros, ordenamiento o paginación en el futuro.
   * @returns Lista completa de entidades `Ticket`.
   */
  async execute(): Promise<Ticket[]> {
    const tickets = await this.repo.list()

    // Ejemplo de extensión futura:
    // return tickets.filter(t => t.isActive).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    return tickets
  }
}
