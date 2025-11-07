import { Ticket } from "../../domain/entities/Ticket";
import { TicketId } from "../../domain/value-objects/TicketId"

export interface TicketRepository {
    save(ticket: Ticket): Promise<void>;
    findById(id: TicketId): Promise<Ticket | null>;
    list(): Promise<Ticket[]>;
    findByFilters(filters: {
        areaId?: string
        from?: Date
        to?: Date
    }): Promise<Ticket[]>
}
