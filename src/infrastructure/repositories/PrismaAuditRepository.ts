<<<<<<< HEAD
import { prismaClient } from "../db/prisma";
import type { AuditRepository } from "../../application/ports/AuditRepository";
import type { RehydrateAuditTrailDto } from "../../application/dtos/audit";
import { AuditTrail } from "../../domain/entities/AuditTrail";
import type { InputJsonValue } from "@prisma/client/runtime/library";
=======
import { prismaClient } from "../db/prisma"
import type { AuditRepository } from "../../application/ports/AuditRepository"
import type { RehydrateAuditTrailDto } from "../../application/dtos/audit"
import { AuditTrail } from "../../domain/entities/AuditTrail"
import type { InputJsonValue } from "@prisma/client/runtime/library"
>>>>>>> main

/**
 * Mapper responsible for converting between the `AuditTrail` domain entity
 * and the persistence model handled by Prisma.
 */
class AuditMapper {
    static toPersistence(audit: AuditTrail): {
        id: string;
        ticketId: string | null;
        actorId: string;
        action: string;
        entityType: string;
        entityId: string;
        changes: InputJsonValue | null;
        metadata: InputJsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        occurredAt: Date;
    } {
        const actorIdStr = audit.actorId?.toString();

<<<<<<< HEAD
        // Validar que sea un UUID válido
        const uuidRegex =
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
=======
        // Validate that it is a valid UUID
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
>>>>>>> main
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
        };
    }

<<<<<<< HEAD
    static toDomain(record: unknown): AuditTrail {
        // Asegurarnos de mapear el campo `occurredAt` que espera la entidad de dominio.
        // Los registros en la base de datos pueden venir con `occurredAt` o `createdAt`
        // (dependiendo del esquema), así que preferimos `occurredAt` y hacemos
        // fallback a `createdAt` si no existe.
        const r = record as Record<string, unknown>;
        const adaptedRecord = {
            id: r.id as string,
            ticketId: (r.ticketId as string) ?? null,
            actorId: r.actorId as string,
            action: r.action as string,
            entityType: r.entityType as string,
            entityId: r.entityId as string,
            changes: (r.changes as Record<string, unknown>) ?? null,
            metadata: (r.metadata as Record<string, unknown>) ?? null,
            ipAddress: (r.ipAddress as string) ?? null,
            userAgent: (r.userAgent as string) ?? null,
            occurredAt: (r.occurredAt as Date) ?? (r.createdAt as Date) ?? new Date(),
        } as RehydrateAuditTrailDto;

        return AuditTrail.rehydrate(adaptedRecord);
=======
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
>>>>>>> main
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
        const data = AuditMapper.toPersistence(audit);
        // casteamos a any aquí porque el tipo exacto de Input JSON en Prisma
        // puede variar (JsonNull/DbNull) y es más sencillo dejar que Prisma
        // maneje la coerción en tiempo de ejecución.
        await prismaClient.auditTrail.create({ data: data as any });
    }

    /**
     * Gets all audit records associated with a ticket.
     * Returns a list of `AuditTrail` domain entities.
     */
    async findByTicketId(ticketId: string): Promise<AuditTrail[]> {
        const rows = await prismaClient.auditTrail.findMany({
            where: { ticketId },
            orderBy: { occurredAt: "desc" },
        });
        return rows.map(AuditMapper.toDomain);
    }

    /**
     * Gets all audit records associated with an actor (user).
     */
    async findByActorId(actorId: string): Promise<AuditTrail[]> {
        const rows = await prismaClient.auditTrail.findMany({
            where: { actorId },
            orderBy: { occurredAt: "desc" },
        });
        return rows.map(AuditMapper.toDomain);
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
        });
        return rows.map(AuditMapper.toDomain);
    }
}
