import type { TicketRepository } from "../ports/TicketRepository";
import type { AreaRepository } from "../ports/AreaRepository";
import type { Clock } from "../ports/Clock";
import type { EventBus } from "../ports/EventBus";
import { CreateTicketSchema, type CreateTicketInput } from "../dtos/ticket";
import { Ticket } from "../../domain/entities/Ticket";

import type { AuditRepository } from "../ports/AuditRepository";
import { AuditTrail } from "../../domain/entities/AuditTrail";
import { UserId } from "../../domain/value-objects/UserId";

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
        private readonly auditRepo: AuditRepository,
    ) {}

    async execute(input: CreateTicketInput): Promise<Ticket> {
        // Validar DTO con Zod
        const validatedInput = CreateTicketSchema.parse(input);

        // Obtener el área (para SLA)
        const area = await this.areaRepo.findById(validatedInput.areaId);
        if (!area) {
            throw new Error("Área no encontrada");
        }

        // Obtener tiempo SLA desde el área, asegurando compatibilidad con Ticket.create()
        const slaMinutes = area.slaResolutionMinutes ?? null; // ✅ conversión explícita

        // Crear entidad de dominio
        const ticket = Ticket.create(validatedInput, slaMinutes, this.clock.now());

        // Persistir el ticket
        await this.ticketRepo.save(ticket);

        const audit = AuditTrail.create(
            {
                ticketId: ticket.id.toString(), // 👈 clave para asociar el registro
                actorId: UserId.from(validatedInput.userId), // el usuario que creó el ticket
                action: "CREATE_TICKET",
                entityType: "Ticket",
                entityId: ticket.id.toString(),
                changes: {
                    title: validatedInput.title,
                    description: validatedInput.description,
                    priority: validatedInput.priority,
                    areaId: validatedInput.areaId,
                },
                metadata: {
                    source: "API",
                },
            },
            this.clock.now(),
        );

        await this.auditRepo.save(audit);

        // Publicar eventos de dominio
        const events = ticket.pullDomainEvents();
        await this.eventBus.publishAll(events);

        return ticket;
    }
}
