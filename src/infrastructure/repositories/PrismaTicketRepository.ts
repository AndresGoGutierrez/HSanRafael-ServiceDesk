import { Ticket } from "../../domain/entities/Ticket"
import { TicketId } from "../../domain/value-objects/TicketId"
import { UserId } from "../../domain/value-objects/UserId"
import type { RehydrateTicketDto } from "../../application/dtos/ticket"
import type { TicketRepository } from "../../application/ports/TicketRepository"
import { prismaClient } from "../db/prisma"

/**
 * Mapper para convertir entre entidades de dominio y modelos de Prisma.
 */
class TicketMapper {
  static toPrisma(ticket: Ticket) {
    return {
      id: ticket.id.toString(),
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      requesterId: ticket.requesterId.toString(),
      assigneeId: ticket.assigneeId ? ticket.assigneeId.toString() : null,
      areaId: ticket.areaId,
      slaTargetAt: ticket.slaTargetAt,
      slaBreached: ticket.slaBreached,
      firstResponseAt: ticket.firstResponseAt,
      resolvedAt: ticket.resolvedAt,
      closedAt: ticket.closedAt,
      resolutionSummary: ticket.resolutionSummary,
      createdAt: ticket.createdAt,
    }
  }

  static toDomain(record: any): Ticket {
    return Ticket.rehydrate({
      id: record.id,
      title: record.title,
      description: record.description,
      status: record.status,
      priority: record.priority,
      userId: record.requesterId,
      assigneeId: record.assigneeId,
      areaId: record.areaId,
      slaTargetAt: record.slaTargetAt,
      slaBreached: record.slaBreached,
      firstResponseAt: record.firstResponseAt,
      resolvedAt: record.resolvedAt,
      closedAt: record.closedAt,
      resolutionSummary: record.resolutionSummary,
      createdAt: record.createdAt,
    } as RehydrateTicketDto)
  }
}

/**
 * Implementación del repositorio de Tickets usando Prisma.
 */
export class PrismaTicketRepository implements TicketRepository {
  async save(ticket: Ticket): Promise<void> {
    const data = TicketMapper.toPrisma(ticket)

    await prismaClient.ticket.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    })
  }

  async findById(id: TicketId): Promise<Ticket | null> {
    const record = await prismaClient.ticket.findUnique({
      where: { id: id.toString() },
    })
    return record ? TicketMapper.toDomain(record) : null
  }

  async list(): Promise<Ticket[]> {
    const records = await prismaClient.ticket.findMany({
      orderBy: { createdAt: "desc" },
    })
    return records.map(TicketMapper.toDomain)
  }
  async findByFilters(filters: { areaId?: string; from?: Date; to?: Date }): Promise<Ticket[]> {
    const where: Record<string, any> = {}

    if (filters.areaId) {
      where.areaId = filters.areaId
    }

    if (filters.from || filters.to) {
      where.createdAt = {}
      if (filters.from) where.createdAt.gte = filters.from
      if (filters.to) where.createdAt.lte = filters.to
    }

    const records = await prismaClient.ticket.findMany({ where })

    // ✅ Convertir los registros crudos en entidades de dominio
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
        createdAt: row.createdAt
      })
    )
  }
}
