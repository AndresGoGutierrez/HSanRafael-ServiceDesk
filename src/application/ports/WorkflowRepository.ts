import type { Workflow } from "../../domain/entities/Workflow";

/**
 * Contrato del repositorio de Workflow.
 * Define las operaciones de persistencia de la entidad Workflow dentro del dominio.
 *
 * 👉 Este repositorio actúa como un puerto (interface) en la arquitectura limpia,
 * separando la lógica de negocio de los detalles de infraestructura (ORM, base de datos, etc.).
 */
export interface WorkflowRepository {
    /**
     * Persiste una entidad `Workflow` (creación o actualización).
     * Si el workflow ya existe, se actualiza; de lo contrario, se crea uno nuevo.
     */
    save(workflow: Workflow): Promise<void>;

    /**
     * Busca un Workflow por su identificador único.
     * @param id Identificador UUID del Workflow.
     * @returns Instancia de `Workflow` o `null` si no existe.
     */
    findById(id: string): Promise<Workflow | null>;

    /**
     * Obtiene todos los Workflows asociados a un área específica.
     * @param areaId Identificador UUID del área.
     * @returns Arreglo de workflows (por ejemplo, ordenados por fecha de creación descendente).
     */
    findByAreaId(areaId: string): Promise<Workflow[]>;

    /**
     * Obtiene el Workflow más reciente asociado a un área.
     * @param areaId Identificador UUID del área.
     * @returns Instancia de `Workflow` o `null` si no existe.
     */
    findLatestByAreaId(areaId: string): Promise<Workflow | null>;

    /**
     * Lista todos los Workflows disponibles en el sistema.
     * Ideal para auditoría o administración.
     */
    listAll(): Promise<Workflow[]>;

    /**
     * Elimina un Workflow por su identificador único.
     * La operación debe ser idempotente (no lanzar error si el registro no existe).
     * @param id Identificador UUID del Workflow.
     */
    deleteById(id: string): Promise<void>;
}
