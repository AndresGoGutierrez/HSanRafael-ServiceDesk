import type { SLA } from "../../domain/entities/SLA";

/**
 * Contrato del repositorio de SLA.
 * Define las operaciones de persistencia para la entidad SLA.
 *
 * 👉 Este repositorio actúa como puerto (interfaz) dentro de la arquitectura limpia,
 * separando la lógica de dominio de los detalles de infraestructura.
 */
export interface SLARepository {
    /**
     * Persiste una entidad `SLA` (creación o actualización).
     * Si el SLA ya existe, se actualiza; de lo contrario, se crea uno nuevo.
     */
    save(sla: SLA): Promise<void>;

    /**
     * Busca un SLA por su identificador único.
     * @param id Identificador UUID del SLA.
     * @returns Instancia de `SLA` o `null` si no existe.
     */
    findById(id: string): Promise<SLA | null>;

    /**
     * Obtiene el SLA asociado a un área específica.
     * @param areaId Identificador UUID del área.
     * @returns Instancia de `SLA` o `null` si no existe.
     */
    findByAreaId(areaId: string): Promise<SLA | null>;

    /**
     * Lista todos los SLAs almacenados en el sistema.
     * Ideal para administración o auditoría.
     */
    listAll(): Promise<SLA[]>;

    /**
     * Elimina un SLA por su identificador único.
     * Si no existe, la operación debe ser idempotente (no lanzar error).
     * @param id Identificador UUID del SLA.
     */
    deleteById(id: string): Promise<void>;
}
