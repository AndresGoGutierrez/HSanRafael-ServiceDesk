import type { TicketRepository } from "../ports/TicketRepository";
import type { AreaRepository } from "../ports/AreaRepository";
import type { Clock } from "../ports/Clock";
import type { EventBus } from "../ports/EventBus";
import { CreateTicketSchema, type CreateTicketInput } from "../dtos/ticket";
import { Ticket } from "../../domain/entities/Ticket";

/**
 * Caso de uso: Crear un nuevo Ticket.
 * 
 * - Valida los datos de entrada mediante Zod (CreateTicketSchema)
 * - Verifica que el área exista y obtiene su configuración de SLA
 * - Crea la entidad Ticket aplicando las reglas de negocio
 * - Persiste el Ticket usando el repositorio
 * - Publica los eventos de dominio generados
 */
export class CreateTicket {
    constructor(
        private readonly ticketRepo: TicketRepository,
        private readonly areaRepo: AreaRepository,
        private readonly clock: Clock,
        private readonly eventBus: EventBus,
    ) { }

    async execute(input: CreateTicketInput): Promise<Ticket> {
        // Validar DTO con Zod
        const validatedInput = CreateTicketSchema.parse(input);

        // Obtener el área (para SLA)
        const area = await this.areaRepo.findById(validatedInput.areaId);
        if (!area) {
            throw new Error("Área no encontrada");
        }

        // Obtener tiempo SLA desde el área
        const slaMinutes = area.slaResolutionMinutes;

        // Crear entidad de dominio
        const ticket = Ticket.create(validatedInput, slaMinutes, this.clock.now());

        // Persistir el ticket
        await this.ticketRepo.save(ticket);

        // Publicar eventos de dominio
        const events = ticket.pullDomainEvents();
        await this.eventBus.publishAll(events);

        return ticket;
    }
}
