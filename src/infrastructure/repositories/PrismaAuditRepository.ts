import { prismaClient } from "../db/prisma"
import type { AuditRepository } from "../../application/ports/AuditRepository"
import type { RehydrateAuditTrailDto } from "../../application/dtos/audit"
import { AuditTrail } from "../../domain/entities/AuditTrail"
import type { InputJsonValue } from "@prisma/client/runtime/library"




/**
 * Mapper responsable de convertir entre la entidad de dominio `AuditTrail`
 * y el modelo de persistencia manejado por Prisma.
 */
class AuditMapper {
    static toPersistence(audit: AuditTrail) {
        const actorIdStr = audit.actorId?.toString();

        // Validar que sea un UUID válido
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
        const adaptedRecord = {
            ...record,
            createdAt: record.occurredAt,
        } as Omit<RehydrateAuditTrailDto, "occurredAt"> & { createdAt: Date }

        return AuditTrail.rehydrate(adaptedRecord)
    }
}

/**
 * Implementación del repositorio de auditoría (`AuditRepository`)
 * que usa Prisma ORM como infraestructura de persistencia.
 */
export class PrismaAuditRepository implements AuditRepository {
    /**
     * Persiste un registro de auditoría. Cada evento es inmutable,
     * por lo tanto se utiliza `create` en lugar de `upsert` o `update`.
     */
    async save(audit: AuditTrail): Promise<void> {
        const data = AuditMapper.toPersistence(audit)
        await prismaClient.auditTrail.create({ data })
    }

    /**
     * Obtiene todos los registros de auditoría asociados a un ticket.
     * Retorna una lista de entidades de dominio `AuditTrail`.
     */
    async findByTicketId(ticketId: string): Promise<AuditTrail[]> {
        const rows = await prismaClient.auditTrail.findMany({
            where: { ticketId },
            orderBy: { occurredAt: "desc" },
        })
        return rows.map(AuditMapper.toDomain)
    }

    /**
     * Obtiene todos los registros de auditoría asociados a un actor (usuario).
     */
    async findByActorId(actorId: string): Promise<AuditTrail[]> {
        const rows = await prismaClient.auditTrail.findMany({
            where: { actorId },
            orderBy: { occurredAt: "desc" },
        })
        return rows.map(AuditMapper.toDomain)
    }

    /**
     * Obtiene registros de auditoría relacionados con una entidad específica.
     * @param entityType Tipo de entidad (por ejemplo: "Ticket", "User", etc.)
     * @param entityId Identificador único de la entidad.
     */
    async findByEntity(entityType: string, entityId: string): Promise<AuditTrail[]> {
        const rows = await prismaClient.auditTrail.findMany({
            where: { entityType, entityId },
            orderBy: { occurredAt: "desc" },
        })
        return rows.map(AuditMapper.toDomain)
    }
}
