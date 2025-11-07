import type { AreaRepository } from "../ports/AreaRepository"
import type { Area } from "../../domain/entities/Area"

/**
 * Caso de uso: listar todas las áreas existentes.
 * Retorna las entidades del dominio tal como se encuentran en el repositorio.
 */
export class ListAreas {
  constructor(private readonly repo: AreaRepository) {}

  /**
   * Ejecuta la operación de listado.
   * Puede adaptarse para aplicar filtros o paginación en el futuro.
   * @returns Lista de entidades `Area`.
   */
  async execute(): Promise<Area[]> {
    const areas = await this.repo.list()

    // En caso de necesitar validación, ordenamiento o filtrado:
    // return areas.filter(a => a.isActive).sort((a, b) => a.name.localeCompare(b.name))

    return areas
  }
}
