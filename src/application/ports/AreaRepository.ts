import type { Area } from "../../domain/entities/Area";

/**
 * Area repository contract.
 * Defines the persistence operations that must be implemented
 * by the infrastructure layer.
 */
export interface AreaRepository {
    /**
     * Persists an `Area` entity (creation or update).
     * @param area Domain entity to be saved.
     */
    save(area: Area): Promise<void>;

    /**
     * Searches for an area by its unique identifier.
     * @param id UUID identifier of the area.
     * @returns Instance of `Area` or `null` if it does not exist.
     */
    findById(id: string): Promise<Area | null>;

    /**
     * Searches for an area by name.
     * @param name Name of the area.
     * @returns Instance of `Area` or `null` if it does not exist.
     */
    findByName(name: string): Promise<Area | null>;

    /**
     * Lists all stored areas.
     * @returns Array of `Area` entities.
     */
    list(): Promise<Area[]>;

    /**
     * Deletes an area by its ID.
     * Although not always necessary in DDD, it can be implemented
     * as physical or logical deletion depending on the use case.
     */
    delete?(id: string): Promise<void>;
}
