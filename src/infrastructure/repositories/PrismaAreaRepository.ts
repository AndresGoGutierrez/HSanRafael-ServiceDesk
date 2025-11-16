import type { RehydrateAreaDto } from "../../application/dtos/area"
import type { AreaRepository } from "../../application/ports/AreaRepository"
import { Area } from "../../domain/entities/Area"
import { prismaClient } from "../db/prisma"

/**
 * Mapper between the `Area` domain entity and the Prisma model.
 * Keeps the transformation logic isolated.
 */
export class AreaMapper {
  static toPrisma(area: Area) {
    return {
      id: area.id.toString(),
      name: area.name,
      description: area.description,
      isActive: area.isActive,
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
    }
  }

  static toResponseList(areas: Area[]) {
    return areas.map((a) => this.toResponse(a))
  }

}
/**
 * Implementation of the area repository using Prisma ORM.
 * Responsible for the persistence and rehydration of `Area` entities.
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
