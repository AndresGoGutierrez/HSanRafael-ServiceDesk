import { Ticket } from "../../domain/entities/Ticket";

export interface TicketRepository {
    save(ticket: Ticket): Promise<void>;
    findById(id: string): Promise<Ticket | null>;
    list(): Promise<Ticket[]>;
}
