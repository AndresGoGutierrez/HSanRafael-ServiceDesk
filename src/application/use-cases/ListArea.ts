import type { AreaRepository } from "../ports/AreaRepository"
import { AreaMapper } from "../../infrastructure/repositories/PrismaAreaRepository"
import type { Area } from "../../domain/entities/Area"

/**
 * Caso de uso: listar todas las áreas existentes.
 * Retorna las entidades del dominio tal como se encuentran en el repositorio.
 */
export class ListAreas {
  constructor(private readonly repo: AreaRepository) { }

  /**
   * Ejecuta la operación de listado.
   * Puede adaptarse para aplicar filtros o paginación en el futuro.
   * @returns Lista de entidades `Area`.
   */
  async execute(): Promise<any[]> {
    const areas: Area[] = await this.repo.list()

    // Mapeamos las entidades de dominio a objetos planos
    return AreaMapper.toResponseList(areas)
  }
}
