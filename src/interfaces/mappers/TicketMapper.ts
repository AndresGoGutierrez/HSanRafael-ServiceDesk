
import { Ticket } from "../../domain/entities/Ticket";


export const toHttp = (ticket: Ticket) => ({
    id: ticket.id.toString(),
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    userId: ticket.userId,
    areaId: ticket.areaId,
    created: ticket.createdAt
}
)