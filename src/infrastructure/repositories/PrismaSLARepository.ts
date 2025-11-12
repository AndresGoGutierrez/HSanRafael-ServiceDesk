import type { SLARepository } from "../../application/ports/SLARepository";
import type { RehydrateSLADto } from "../../domain/entities/SLA";
import { SLA } from "../../domain/entities/SLA";
import { prismaClient } from "../db/prisma";

/**
 * Mapper responsable de convertir entre:
 *  - Entidad de dominio `SLA`
 *  - Modelo de persistencia Prisma (`SLA` table)
 *  - Objeto de respuesta (DTO)
 *
 * Esta clase garantiza que los detalles de infraestructura
 * no "contaminen" el dominio.
 */
export class SLAMapper {
    /**
     * Convierte una entidad de dominio `SLA` en un objeto compatible con Prisma.
     */
    static toPrisma(sla: SLA): {
        id: string;
        areaId: string;
        responseTimeMinutes: number;
        resolutionTimeMinutes: number;
        createdAt: Date;
        updatedAt: Date;
    } {
        return {
            id: sla.id.toString(),
            areaId: sla.areaId.toString(),
            responseTimeMinutes: sla.responseTimeMinutes,
            resolutionTimeMinutes: sla.resolutionTimeMinutes,
            createdAt: sla.createdAt,
            updatedAt: sla.updatedAt,
        };
    }

    /**
     * Restaura una entidad de dominio `SLA` desde un registro de base de datos.
     */
    static toDomain(record: RehydrateSLADto): SLA {
        return SLA.rehydrate(record);
    }

    /**
     * Convierte una entidad de dominio `SLA` en un DTO de salida.
     * Ideal para respuestas HTTP o serialización.
     */
    static toResponse(sla: SLA): {
        id: string;
        areaId: string;
        responseTimeMinutes: number;
        resolutionTimeMinutes: number;
        createdAt: string;
        updatedAt: string;
    } {
        return {
            id: sla.id.toString(),
            areaId: sla.areaId.toString(),
            responseTimeMinutes: sla.responseTimeMinutes,
            resolutionTimeMinutes: sla.resolutionTimeMinutes,
            createdAt: sla.createdAt.toISOString(),
            updatedAt: sla.updatedAt.toISOString(),
        };
    }
}

/**
 * Implementación del repositorio de SLA usando Prisma ORM.
 *
 * Encapsula completamente el acceso a la base de datos
 * y garantiza que el dominio no dependa de infraestructura.
 */
export class PrismaSLARepository implements SLARepository {
    async save(sla: SLA): Promise<void> {
        const data = SLAMapper.toPrisma(sla);
        await prismaClient.sLA.upsert({
            where: { id: data.id },
            create: data,
            update: {
                responseTimeMinutes: data.responseTimeMinutes,
                resolutionTimeMinutes: data.resolutionTimeMinutes,
                updatedAt: data.updatedAt,
            },
        });
    }

    async findById(id: string): Promise<SLA | null> {
        const row = await prismaClient.sLA.findUnique({ where: { id } });
        return row ? SLAMapper.toDomain(row as RehydrateSLADto) : null;
    }

    async findByAreaId(areaId: string): Promise<SLA | null> {
        const row = await prismaClient.sLA.findUnique({ where: { areaId } });
        return row ? SLAMapper.toDomain(row as RehydrateSLADto) : null;
    }

    async listAll(): Promise<SLA[]> {
        const rows = await prismaClient.sLA.findMany({
            orderBy: { createdAt: "desc" },
        });
        return rows.map((row) => SLAMapper.toDomain(row as RehydrateSLADto));
    }

    async deleteById(id: string): Promise<void> {
        await prismaClient.sLA.delete({ where: { id } });
    }
}
