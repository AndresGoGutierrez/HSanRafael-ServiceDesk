import { Ticket } from "../../domain/entities/Ticket"

export class TicketMapper {
  static toHttp(ticket: Ticket) {
    return {
      id: ticket.id.toString(),
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      userId: ticket.requesterId.toString(),
      areaId: ticket.areaId,
      createdAt: ticket.createdAt,
    }
  }
}
