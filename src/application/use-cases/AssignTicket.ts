import { TicketId } from "../../domain/value-objects/TicketId";
import { UserId } from "../../domain/value-objects/UserId";
import type { TicketRepository } from "../ports/TicketRepository";
import type { Clock } from "../ports/Clock";
import type { EventBus } from "../ports/EventBus";
import { AssignTicketSchema, type AssignTicketInput } from "../dtos/ticket";

/**
 * Caso de uso: Asignar un ticket a un usuario.
 *
 * Valida los datos, recupera el ticket, aplica la lógica de negocio
 * y publica los eventos resultantes.
 */
export class AssignTicket {
    constructor(
        private readonly repository: TicketRepository,
        private readonly clock: Clock,
        private readonly eventBus: EventBus,
    ) {}

    async execute(ticketId: string, input: AssignTicketInput): Promise<void> {
        // 1️⃣ Validar entrada
        const validated = AssignTicketSchema.parse(input);

        // 2️⃣ Convertir a Value Objects del dominio
        const domainTicketId = TicketId.from(ticketId);
        const assigneeId = UserId.from(validated.assigneeId);

        // 3️⃣ Recuperar el ticket
        const ticket = await this.repository.findById(domainTicketId);
        if (!ticket) {
            throw new Error(`Ticket with ID ${ticketId} not found.`);
        }

        // 4️⃣ Ejecutar lógica de dominio
        ticket.assign(assigneeId, this.clock.now());

        // 5️⃣ Persistir cambios
        await this.repository.save(ticket);

        // 6️⃣ Publicar eventos de dominio (si los hay)
        const events = ticket.pullDomainEvents();
        if (events.length > 0) {
            await this.eventBus.publishAll(events);
        }
    }
}
