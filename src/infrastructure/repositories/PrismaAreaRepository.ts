import type { RehydrateAreaDto } from "../../application/dtos/area"
import type { AreaRepository } from "../../application/ports/AreaRepository"
import { Area } from "../../domain/entities/Area"
import { prismaClient } from "../db/prisma"

/**
 * Implementación del repositorio de áreas usando Prisma ORM.
 * Se encarga de la persistencia y rehidratación de entidades del dominio.
 */
export class PrismaAreaRepository implements AreaRepository {
  /**
   * Crea o actualiza una entidad `Area` en la base de datos.
   * Usa `upsert` para garantizar idempotencia.
   */
  async save(area: Area): Promise<void> {
    const data = {
      id: area.id.toString(),
      name: area.name,
      description: area.description,
      isActive: area.isActive,
      slaResponseMinutes: area.slaResponseMinutes,
      slaResolutionMinutes: area.slaResolutionMinutes,
      createdAt: area.createdAt,
    }

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

  /**
   * Busca un área por su ID único.
   * @param id Identificador único del área.
   * @returns La entidad `Area` rehidratada o `null` si no existe.
   */
  async findById(id: string): Promise<Area | null> {
    const row = await prismaClient.area.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  /**
   * Busca un área por su nombre.
   * @param name Nombre del área.
   * @returns La entidad `Area` rehidratada o `null` si no existe.
   */
  async findByName(name: string): Promise<Area | null> {
    const row = await prismaClient.area.findUnique({ where: { name } })
    return row ? this.toDomain(row) : null
  }

  /**
   * Lista todas las áreas ordenadas por fecha de creación descendente.
   */
  async list(): Promise<Area[]> {
    const rows = await prismaClient.area.findMany({
      orderBy: { createdAt: "desc" },
    })
    return rows.map(this.toDomain)
  }

  /**
   * Convierte un registro de base de datos en una entidad de dominio `Area`.
   * Aísla la lógica de rehidratación y facilita futuras transformaciones.
   */
  private toDomain(row: unknown): Area {
    return Area.rehydrate(row as RehydrateAreaDto)
  }
}
