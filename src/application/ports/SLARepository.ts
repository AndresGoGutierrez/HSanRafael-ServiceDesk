import type { SLA } from "../../domain/entities/SLA";

/**
 * Vertrag des SLA-Repositorys.
 * Definiert die Persistenzoperationen für die SLA-Entität.
 *
 * Dieses Repository fungiert als Port (Schnittstelle) innerhalb der sauberen Architektur und
 * trennt die Domänenlogik von den Infrastrukturdetails.
 */
export interface SLARepository {
    /**
     * Persists an `SLA` entity (creation or update).
     * If the SLA already exists, it is updated; otherwise, a new one is created.
     */
    save(sla: SLA): Promise<void>;

    /**
     * Searches for an SLA by its unique identifier.
     * @param id UUID identifier of the SLA.
     * @returns Instance of `SLA` or `null` if it does not exist.
     */
    findById(id: string): Promise<SLA | null>;

    /**
     * Gets the SLA associated with a specific area.
     * @param areaId UUID identifier of the area.
     * @returns Instance of `SLA` or `null` if it does not exist.
     */
    findByAreaId(areaId: string): Promise<SLA | null>;

    /**
     * Lists all SLAs stored in the system.
     * Ideal for administration or auditing.
     */
    listAll(): Promise<SLA[]>;

    /**
     * Deletes an SLA by its unique identifier.
     * If it does not exist, the operation must be idempotent (do not throw an error).
     * @param id UUID identifier of the SLA.
     */
    deleteById(id: string): Promise<void>;
}
