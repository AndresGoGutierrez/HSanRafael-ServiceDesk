import { RehydrateTicketDto } from "../../application/dtos/ticket";
import { TicketRepository } from "../../application/ports/TicketRepository";
import { Ticket } from "../../domain/entities/Ticket";
import { prismaClient } from "../db/prisma";

export class PrismaTicketRepository implements TicketRepository {
    async save(ticket: Ticket): Promise<void> {
        await prismaClient.ticket.upsert({
            where: { id: ticket.id.toString() },
            create: {
                id: ticket.id.toString(),
                title: ticket.title,
                status: ticket.status,
                priority: ticket.priority,
                userId: ticket.userId,
                areaId: ticket.areaId,
            },
            update: {
                title: ticket.title,
                status: ticket.status,
                priority: ticket.priority,
            },
        });
    }
    async findById(id: string): Promise<Ticket | null> {
        const row = await prismaClient.ticket.findUnique({
            where: { id },
        });

        return row ? Ticket.rehydrate(row as RehydrateTicketDto) : null;
    }
    async list(): Promise<Ticket[]> {
        const rows = await prismaClient.ticket.findMany({
            orderBy: { createdAt: "desc" },
        });

        return rows.map((row) => Ticket.rehydrate(row as RehydrateTicketDto));
    }
}
