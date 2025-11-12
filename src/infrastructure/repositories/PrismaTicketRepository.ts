import { Ticket } from "../../domain/entities/Ticket";
import { TicketId } from "../../domain/value-objects/TicketId";
import { UserId } from "../../domain/value-objects/UserId";
import type { RehydrateTicketDto } from "../../application/dtos/ticket";
import type { TicketRepository } from "../../application/ports/TicketRepository";
import { prismaClient } from "../db/prisma";

/**
 * Mapper para convertir entre entidades de dominio y modelos de Prisma.
 */
class TicketMapper {
    static toPrisma(ticket: Ticket): {
        id: string;
        title: string;
        description: string | null;
        status: string;
        priority: string;
        requesterId: string;
        assigneeId?: string | undefined;
        areaId: string;
        slaTargetAt: Date | null;
        slaBreached: boolean;
        firstResponseAt: Date | null;
        resolvedAt: Date | null;
        closedAt: Date | null;
        resolutionSummary: string | null;
        createdAt: Date;
    } {
        return {
            id: ticket.id.toString(),
            title: ticket.title,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            requesterId: ticket.requesterId.toString(),
            assigneeId: ticket.assigneeId ? ticket.assigneeId.toString() : undefined,
            areaId: ticket.areaId,
            slaTargetAt: ticket.slaTargetAt,
            slaBreached: ticket.slaBreached,
            firstResponseAt: ticket.firstResponseAt,
            resolvedAt: ticket.resolvedAt,
            closedAt: ticket.closedAt,
            resolutionSummary: ticket.resolutionSummary,
            createdAt: ticket.createdAt,
        };
    }

    static toDomain(record: unknown): Ticket {
        const r = record as Record<string, unknown>;
        return Ticket.rehydrate({
            id: r.id as string,
            title: r.title as string,
            description: (r.description as string) ?? null,
            status: r.status as string,
            priority: r.priority as string,
            userId: r.requesterId as string,
            assigneeId: (r.assigneeId as string) ?? null,
            areaId: r.areaId as string,
            slaTargetAt: (r.slaTargetAt as Date) ?? null,
            slaBreached: (r.slaBreached as boolean) ?? false,
            firstResponseAt: (r.firstResponseAt as Date) ?? null,
            resolvedAt: (r.resolvedAt as Date) ?? null,
            closedAt: (r.closedAt as Date) ?? null,
            resolutionSummary: (r.resolutionSummary as string) ?? null,
            createdAt: r.createdAt as Date,
        } as RehydrateTicketDto);
    }
}

/**
 * Implementación del repositorio de Tickets usando Prisma.
 */
export class PrismaTicketRepository implements TicketRepository {
    async save(ticket: Ticket): Promise<void> {
        const data = TicketMapper.toPrisma(ticket);

        await prismaClient.ticket.upsert({
            where: { id: data.id },
            create: data as any,
            update: data as any,
        });
    }

    async findById(id: TicketId): Promise<Ticket | null> {
        const record = await prismaClient.ticket.findUnique({
            where: { id: id.toString() },
        });
        return record ? TicketMapper.toDomain(record) : null;
    }

    async list(): Promise<Ticket[]> {
        const records = await prismaClient.ticket.findMany({
            orderBy: { createdAt: "desc" },
        });
        return records.map(TicketMapper.toDomain);
    }

    async findByFilters(filters: { areaId?: string; from?: Date; to?: Date }): Promise<Ticket[]> {
        const where: any = {};

        if (filters.areaId) {
            where.areaId = filters.areaId;
        }

        if (filters.from || filters.to) {
            where.createdAt = {};
            if (filters.from) where.createdAt.gte = filters.from;
            if (filters.to) where.createdAt.lte = filters.to;
        }

        const records = await prismaClient.ticket.findMany({ where: where as any });

        // Convertir los registros crudos en entidades de dominio
        return records.map((row) =>
            Ticket.rehydrate({
                id: row.id,
                title: row.title,
                description: row.description ?? null,
                status: row.status as RehydrateTicketDto["status"],
                priority: row.priority as RehydrateTicketDto["priority"],
                userId: row.requesterId,
                assigneeId: row.assigneeId ?? null,
                areaId: row.areaId,
                slaTargetAt: row.slaTargetAt ?? null,
                slaBreached: row.slaBreached ?? false,
                firstResponseAt: row.firstResponseAt ?? null,
                resolvedAt: row.resolvedAt ?? null,
                closedAt: row.closedAt ?? null,
                resolutionSummary: row.resolutionSummary ?? null,
                createdAt: row.createdAt,
            }),
        );
    }

    async countByAreaAndStatus(areaId: string, statuses: string[]): Promise<number> {
        return prismaClient.ticket.count({
            where: {
                areaId,
                status: { in: statuses },
            },
        });
    }
}
