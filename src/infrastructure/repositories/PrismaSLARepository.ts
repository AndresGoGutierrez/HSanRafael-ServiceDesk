import type { SLARepository } from "../../application/ports/SLARepository"
import type { RehydrateSLADto } from "../../domain/entities/SLA"
import { SLA } from "../../domain/entities/SLA"
import { prismaClient } from "../db/prisma"

/**
 * Mapper responsible for converting between:
 *  - Domain entity `SLA`
 *  - Prisma persistence model (`SLA` table)
 *  - Response object (DTO)
 *
 * This class ensures that infrastructure details
 * do not “contaminate” the domain.
 */
export class SLAMapper {
    /**
     * Converts an `SLA` domain entity into a Prisma-compatible object.
     */
    static toPrisma(sla: SLA) {
        return {
            id: sla.id.toString(),
            areaId: sla.areaId.toString(),
            responseTimeMinutes: sla.responseTimeMinutes,
            resolutionTimeMinutes: sla.resolutionTimeMinutes,
            createdAt: sla.createdAt,
            updatedAt: sla.updatedAt,
        }
    }

    /**
     * Restores an `SLA` domain entity from a database record.
     */
    static toDomain(record: RehydrateSLADto): SLA {
        return SLA.rehydrate(record)
    }

    /**
     * Converts an `SLA` domain entity into an output DTO.
     * Ideal for HTTP responses or serialization.
     */
    static toResponse(sla: SLA) {
        return {
            id: sla.id.toString(),
            areaId: sla.areaId.toString(),
            responseTimeMinutes: sla.responseTimeMinutes,
            resolutionTimeMinutes: sla.resolutionTimeMinutes,
            createdAt: sla.createdAt.toISOString(),
            updatedAt: sla.updatedAt.toISOString(),
        }
    }
}

/**
 * Implementation of the SLA repository using Prisma ORM.
 *
 * Completely encapsulates database access
 * and ensures that the domain does not depend on infrastructure.
 */
export class PrismaSLARepository implements SLARepository {
    async save(sla: SLA): Promise<void> {
        const data = SLAMapper.toPrisma(sla)
        await prismaClient.sLA.upsert({
            where: { id: data.id },
            create: data,
            update: {
                responseTimeMinutes: data.responseTimeMinutes,
                resolutionTimeMinutes: data.resolutionTimeMinutes,
                updatedAt: data.updatedAt,
            },
        })
    }

    async findById(id: string): Promise<SLA | null> {
        const row = await prismaClient.sLA.findUnique({ where: { id } })
        return row ? SLAMapper.toDomain(row as RehydrateSLADto) : null
    }

    async findByAreaId(areaId: string): Promise<SLA | null> {
        const row = await prismaClient.sLA.findUnique({ where: { areaId } })
        return row ? SLAMapper.toDomain(row as RehydrateSLADto) : null
    }

    async listAll(): Promise<SLA[]> {
        const rows = await prismaClient.sLA.findMany({
            orderBy: { createdAt: "desc" },
        })
        return rows.map((row) => SLAMapper.toDomain(row as RehydrateSLADto))
    }

    async deleteById(id: string): Promise<void> {
        await prismaClient.sLA.delete({ where: { id } })
    }
}
