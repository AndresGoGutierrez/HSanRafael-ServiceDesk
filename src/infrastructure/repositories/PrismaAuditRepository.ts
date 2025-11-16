import { prismaClient } from "../db/prisma"
import type { AuditRepository } from "../../application/ports/AuditRepository"
import type { RehydrateAuditTrailDto } from "../../application/dtos/audit"
import { AuditTrail } from "../../domain/entities/AuditTrail"
import type { InputJsonValue } from "@prisma/client/runtime/library"

/**
 * Mapper responsible for converting between the `AuditTrail` domain entity
 * and the persistence model handled by Prisma.
 */
class AuditMapper {
    static toPersistence(audit: AuditTrail) {
        const actorIdStr = audit.actorId?.toString();

        // Validate that it is a valid UUID
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        if (!actorIdStr || !uuidRegex.test(actorIdStr)) {
            throw new Error(`AuditMapper: actorId inválido o ausente (${actorIdStr})`);
        }

        return {
            id: audit.id.toString(),
            ticketId: audit.ticketId ?? null,
            actorId: actorIdStr,
            action: audit.action,
            entityType: audit.entityType,
            entityId: audit.entityId,
            changes: audit.changes as InputJsonValue,
            metadata: audit.metadata as InputJsonValue,
            ipAddress: audit.ipAddress ?? null,
            userAgent: audit.userAgent ?? null,
            occurredAt: audit.createdAt,
        }
    }

    static toDomain(record: any): AuditTrail {
        const dto: RehydrateAuditTrailDto = {
            id: record.id,
            ticketId: record.ticketId,
            actorId: record.actorId,
            action: record.action,
            entityType: record.entityType,
            entityId: record.entityId,
            changes: record.changes,
            metadata: record.metadata,
            ipAddress: record.ipAddress,
            userAgent: record.userAgent,
            occurredAt: record.occurredAt,
        }

        return AuditTrail.rehydrate(dto)
    }

}

/**
 * Implementation of the audit repository (`AuditRepository`)
 * that uses Prisma ORM as its persistence infrastructure.
 */
export class PrismaAuditRepository implements AuditRepository {
    /**
     * Persists an audit log. Each event is immutable,
     * therefore `create` is used instead of `upsert` or `update`.
     */
    async save(audit: AuditTrail): Promise<void> {
        const data = AuditMapper.toPersistence(audit)
        await prismaClient.auditTrail.create({ data })
    }

    /**
     * Gets all audit records associated with a ticket.
     * Returns a list of `AuditTrail` domain entities.
     */
    async findByTicketId(ticketId: string): Promise<AuditTrail[]> {
        const rows = await prismaClient.auditTrail.findMany({
            where: { ticketId },
            orderBy: { occurredAt: "desc" },
        })
        return rows.map(AuditMapper.toDomain)
    }

    /**
     * Gets all audit records associated with an actor (user).
     */
    async findByActorId(actorId: string): Promise<AuditTrail[]> {
        const rows = await prismaClient.auditTrail.findMany({
            where: { actorId },
            orderBy: { occurredAt: "desc" },
        })
        return rows.map(AuditMapper.toDomain)
    }

    /**
     * Gets audit records related to a specific entity.
     * @param entityType Entity type (e.g., “Ticket,” “User,” etc.)
     * @param entityId Unique identifier of the entity.
     */
    async findByEntity(entityType: string, entityId: string): Promise<AuditTrail[]> {
        const rows = await prismaClient.auditTrail.findMany({
            where: { entityType, entityId },
            orderBy: { occurredAt: "desc" },
        })
        return rows.map(AuditMapper.toDomain)
    }
}
