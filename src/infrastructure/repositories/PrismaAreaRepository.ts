import type { RehydrateAreaDto } from "../../application/dtos/area"
import type { AreaRepository } from "../../application/ports/AreaRepository"
import { Area } from "../../domain/entities/Area"
import { prismaClient } from "../db/prisma"

/**
 * Mapper entre la entidad de dominio `Area` y el modelo Prisma.
 * Mantiene aislada la lógica de transformación.
 */
export class AreaMapper {
  static toPrisma(area: Area) {
    return {
      id: area.id.toString(),
      name: area.name,
      description: area.description,
      isActive: area.isActive,
      slaResponseMinutes: area.slaResponseMinutes,
      slaResolutionMinutes: area.slaResolutionMinutes,
      createdAt: area.createdAt,
    }
  }

  static toDomain(record: RehydrateAreaDto): Area {
    return Area.rehydrate(record)
  }

  static toResponse(area: Area) {
    return {
      id: area.id.toString(),
      name: area.name,
      description: area.description,
      isActive: area.isActive,
      createdAt: area.createdAt,
      slaResponseMinutes: area.slaResponseMinutes,
      slaResolutionMinutes: area.slaResolutionMinutes,
      workflowConfig: area.workflowConfig ?? null,
    }
  }

  static toResponseList(areas: Area[]) {
    return areas.map((a) => this.toResponse(a))
  }

  


}




/**
 * Implementación del repositorio de áreas usando Prisma ORM.
 * Responsable de la persistencia y rehidratación de entidades `Area`.
 */
export class PrismaAreaRepository implements AreaRepository {
  async save(area: Area): Promise<void> {
    const data = AreaMapper.toPrisma(area)

    await prismaClient.area.upsert({
      where: { id: data.id },
      create: data,
      update: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        slaResponseMinutes: data.slaResponseMinutes,
        slaResolutionMinutes: data.slaResolutionMinutes,
      },
    })
  }

  async findById(id: string): Promise<Area | null> {
    const row = await prismaClient.area.findUnique({ where: { id } })
    return row ? AreaMapper.toDomain(row as RehydrateAreaDto) : null
  }

  async findByName(name: string): Promise<Area | null> {
    const row = await prismaClient.area.findUnique({ where: { name } })
    return row ? AreaMapper.toDomain(row as RehydrateAreaDto) : null
  }

  async list(): Promise<Area[]> {
    const rows = await prismaClient.area.findMany({
      orderBy: { createdAt: "desc" },
    })
    return rows.map((row) => AreaMapper.toDomain(row as RehydrateAreaDto))
  }
}
