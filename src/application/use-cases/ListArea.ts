import type { AreaRepository } from "../ports/AreaRepository"
import { AreaMapper } from "../../infrastructure/repositories/PrismaAreaRepository"
import type { Area } from "../../domain/entities/Area"

/**
 * Use case: list all existing areas.
 * Returns the domain entities as they are found in the repository.
 */
export class ListAreas {
  constructor(private readonly repo: AreaRepository) { }

  /**
   * Executes the listing operation.
   * Can be adapted to apply filters or pagination in the future.
   * @returns List of `Area` entities.
   */
  async execute(): Promise<any[]> {
    const areas: Area[] = await this.repo.list()

    // We map domain entities to flat objects
    return AreaMapper.toResponseList(areas)
  }
}
