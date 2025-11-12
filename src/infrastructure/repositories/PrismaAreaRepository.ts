import type { RehydrateAreaDto } from "../../application/dtos/area";
import type { RehydrateAreaDto as DomainRehydrateAreaDto } from "../../domain/entities/Area";
import type { AreaRepository } from "../../application/ports/AreaRepository";
import { Area } from "../../domain/entities/Area";
import { prismaClient } from "../db/prisma";

/**
 * Mapper entre la entidad de dominio `Area` y el modelo Prisma.
 * Mantiene aislada la lógica de transformación.
 */
export class AreaMapper {
    static toPrisma(area: Area): {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
    } {
        return {
            id: area.id.toString(),
            name: area.name,
            description: area.description,
            isActive: area.isActive,
            createdAt: area.createdAt,
        };
    }

    static toDomain(record: unknown): Area {
        // El registro desde Prisma puede contener `null` para algunos campos
        // (por ejemplo `slaResolutionMinutes`). El constructor de dominio
        // espera `undefined` cuando el valor no está presente, así que
        // normalizamos `null` -> `undefined` antes de rehidratar.
        const r = record as Record<string, unknown>;
        const adapted: DomainRehydrateAreaDto = {
            id: r.id as string,
            name: r.name as string,
            description: (r.description as string) ?? null,
            isActive: (r.isActive as boolean) ?? false,
            createdAt: r.createdAt as Date,
            slaResolutionMinutes: (r.slaResolutionMinutes as number) ?? undefined,
        };

        return Area.rehydrate(adapted);
    }

    static toResponse(area: Area): {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
    } {
        return {
            id: area.id.toString(),
            name: area.name,
            description: area.description,
            isActive: area.isActive,
            createdAt: area.createdAt,
        };
    }

    static toResponseList(
        areas: Area[],
    ): Array<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
    }> {
        return areas.map((a) => this.toResponse(a));
    }
}
/**
 * Implementación del repositorio de áreas usando Prisma ORM.
 * Responsable de la persistencia y rehidratación de entidades `Area`.
 */
export class PrismaAreaRepository implements AreaRepository {
    async save(area: Area): Promise<void> {
        const data = AreaMapper.toPrisma(area);

        await prismaClient.area.upsert({
            where: { id: data.id },
            create: data,
            update: {
                name: data.name,
                description: data.description,
                isActive: data.isActive,
            },
        });
    }

    async findById(id: string): Promise<Area | null> {
        const row = await prismaClient.area.findUnique({ where: { id } });
        return row ? AreaMapper.toDomain(row as RehydrateAreaDto) : null;
    }

    async findByName(name: string): Promise<Area | null> {
        const row = await prismaClient.area.findUnique({ where: { name } });
        return row ? AreaMapper.toDomain(row as RehydrateAreaDto) : null;
    }

    async list(): Promise<Area[]> {
        const rows = await prismaClient.area.findMany({
            orderBy: { createdAt: "desc" },
        });
        return rows.map((row) => AreaMapper.toDomain(row as RehydrateAreaDto));
    }
}
