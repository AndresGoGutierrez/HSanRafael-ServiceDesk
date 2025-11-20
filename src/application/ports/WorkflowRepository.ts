import type { Workflow } from "../../domain/entities/Workflow";

/**
 * Workflow repository contract.
 * Defines the persistence operations of the Workflow entity within the domain.
 *
 * This repository acts as a port (interface) in the clean architecture,
 * separating business logic from infrastructure details (ORM, database, etc.).
 */
export interface WorkflowRepository {
    /**
     * Persists a `Workflow` entity (creation or update).
     * If the workflow already exists, it is updated; otherwise, a new one is created.
     */
    save(workflow: Workflow): Promise<void>;

    /**
     * Searches for a Workflow by its unique identifier.
     * @param id UUID identifier of the Workflow.
     * @returns Instance of `Workflow` or `null` if it does not exist.
     */
    findById(id: string): Promise<Workflow | null>;

    /**
     * Gets all Workflows associated with a specific area.
     * @param areaId UUID identifier of the area.
     * @returns Array of workflows (for example, sorted by creation date in descending order).
     */
    findByAreaId(areaId: string): Promise<Workflow[]>;

    /**
     * Gets the most recent workflow associated with an area.
     * @param areaId UUID identifier of the area.
     * @returns Instance of `Workflow` or `null` if it does not exist.
     */
    findLatestByAreaId(areaId: string): Promise<Workflow | null>;

    /**
     * Lists all Workflows available in the system.
     * Ideal for auditing or administration.
     */
    listAll(): Promise<Workflow[]>;

    /**
     * Deletes a Workflow by its unique identifier.
     * The operation must be idempotent (do not throw an error if the record does not exist).
     * @param id UUID identifier of the Workflow.
     */
    deleteById(id: string): Promise<void>;
}
