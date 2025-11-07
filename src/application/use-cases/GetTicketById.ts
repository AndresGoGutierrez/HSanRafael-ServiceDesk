import { TicketId } from "../../domain/value-objects/TicketId";
import type { TicketRepository } from "../ports/TicketRepository";
import type { Ticket } from "../../domain/entities/Ticket";

/**
 * Caso de uso: Obtener un ticket por su identificador.
 * 
 * - Acepta un string como entrada externa (de un controlador o capa API)
 * - Lo convierte a un Value Object (`TicketId`) para mantener coherencia en el dominio
 * - Delegar la búsqueda al repositorio
 */
export class GetTicketById {
  constructor(private readonly ticketRepo: TicketRepository) {}

  async execute(ticketId: string): Promise<Ticket | null> {
    if (!ticketId) {
      throw new Error("El ID del ticket no puede estar vacío.");
    }

    // ✅ Convertimos la cadena a Value Object
    const id = TicketId.from(ticketId);

    // ✅ El repositorio recibe un objeto de dominio, no un tipo primitivo
    const ticket = await this.ticketRepo.findById(id);

    return ticket ?? null;
  }
}
