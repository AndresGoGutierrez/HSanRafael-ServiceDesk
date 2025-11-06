import { TicketRepository } from "../ports/TicketRepository";
import { Clock } from '../ports/Clock';
import { EventBus } from "../ports/EventBus";
import { CreateTicketInput, CreateTicketSchema } from "../dtos/ticket";
import { Ticket } from '../../domain/entities/Ticket';

export class CreateTicket {
    constructor(
        private readonly repo: TicketRepository,
        private readonly Clock: Clock,
        private readonly bus: EventBus
    ) { }

    async execute(input: CreateTicketInput): Promise<Ticket> {
        const ticket = Ticket.create(
            CreateTicketSchema.parse(input),
            this.Clock.now()
        )

        await this.repo.save(ticket)

        const events = ticket.pullDomainEvents()
        await this.bus.publishAll(events)

        return ticket
    }
}