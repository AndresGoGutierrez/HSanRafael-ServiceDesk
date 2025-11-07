import type { TicketRepository } from "../ports/TicketRepository";
import type { Clock } from "../ports/Clock";
import type { EventBus } from "../ports/EventBus";
import type { TransitionTicketInput } from "../dtos/ticket";
import { TicketId } from "../../domain/value-objects/TicketId";

/**
 * Caso de uso: Transicionar el estado de un Ticket.
 *
 * Este caso de uso se encarga de cambiar el estado de un ticket
 * dentro del dominio, asegurando que:
 *  - El ticket exista.
 *  - La transición de estado sea válida (según las reglas del dominio).
 *  - Los eventos de dominio generados sean publicados.
 *
 * Principios aplicados:
 * - Clean Architecture: sin dependencias de infraestructura.
 * - DDD: la lógica de transición pertenece a la entidad Ticket.
 * - SRP: este caso de uso solo orquesta, no valida reglas de negocio.
 */
export class TransitionTicketStatus {
    constructor(
        private readonly ticketRepository: TicketRepository,
        private readonly clock: Clock,
        private readonly eventBus: EventBus,
    ) { }

    /**
     * Ejecuta la transición de estado de un ticket existente.
     *
     * @param ticketIdString - Identificador del ticket como string (UUID).
     * @param input - Datos con el nuevo estado a transicionar.
     * @throws Error si el ticket no existe o la transición es inválida.
     */
    async execute(ticketIdString: string, input: TransitionTicketInput): Promise<void> {
        // Convertir el string a un Value Object
        const ticketId = TicketId.from(ticketIdString);

        // Buscar el ticket en el repositorio
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new Error(`Ticket with id ${ticketIdString} not found`);
        }

        // Ejecutar la transición dentro del dominio
        ticket.transition(input.status, this.clock.now());

        // Persistir el cambio
        await this.ticketRepository.save(ticket);

        // Publicar eventos de dominio generados
        const domainEvents = ticket.pullDomainEvents();
        await this.eventBus.publishAll(domainEvents);
    }
}
